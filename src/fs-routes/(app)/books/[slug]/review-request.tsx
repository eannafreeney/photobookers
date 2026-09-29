import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { slugSchema } from "../../../../features/app/schema";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import PageHeader from "../../../../components/app/PageHeader";
import InfoPage from "../../../../pages/InfoPage";
import Button from "../../../../components/app/Button";
import FormPost from "../../../../components/forms/FormPost";
import { getFlash, getUser, setFlash } from "../../../../utils";
import { reviewRequestSchema } from "../../../../domain/reviews/schema";
import {
  getReviewerProfile,
  requestReviewCopy,
} from "../../../../domain/reviews/services";
import { getBookBySlug } from "../../../../features/app/services";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const user = await getUser(c);
  if (!user?.id) {
    return c.redirect(
      `/auth/login?redirectUrl=${encodeURIComponent(c.req.path)}`,
    );
  }
  const profile = (await getReviewerProfile(user.id))[1];
  if (!profile) {
    await setFlash(c, "info", "Create a reviewer profile before requesting a copy.");
    return c.redirect("/dashboard/reviewer");
  }
  const [bookErr, result] = await getBookBySlug(slug, "published");
  if (bookErr || !result) {
    return c.html(
      <InfoPage errorMessage={bookErr?.reason ?? "Book not found"} user={user} />,
      404,
    );
  }
  const flash = await getFlash(c);
  return c.html(
    <AppLayout
      title={`Request ${result.book.title}`}
      user={user}
      flash={flash}
      currentPath={c.req.path}
    >
      <Page>
        <div class="mx-auto flex w-full max-w-xl flex-col gap-6">
          <PageHeader
            kicker="Review copy"
            title={result.book.title}
            intro="Tell the creator why you'd like a copy. They send the book themselves."
          />
          <FormPost
            action={`/books/${result.book.slug}/review-request`}
            className="flex flex-col gap-4"
          >
            <label class="flex flex-col gap-1 text-sm text-on-surface">
              Note
              <textarea
                name="note"
                rows={4}
                class="rounded-radius border border-outline bg-surface px-2 py-2 text-on-surface"
              />
            </label>
            <Button variant="solid" color="primary" width="fit">
              Request a copy
            </Button>
          </FormPost>
        </div>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const slug = c.req.param("slug") ?? "";
  const user = await getUser(c);
  if (!user?.id) return c.redirect("/auth/login");
  const parsed = reviewRequestSchema.safeParse(await c.req.parseBody());
  if (!parsed.success) {
    await setFlash(c, "danger", "Check the note and try again");
    return c.redirect(`/books/${slug}/review-request`);
  }
  const [error] = await requestReviewCopy(user.id, slug, parsed.data.note);
  if (error) {
    await setFlash(c, "danger", error.reason);
    return c.redirect(`/books/${slug}/review-request`);
  }
  await setFlash(c, "success", "Request sent");
  return c.redirect("/dashboard/reviewer");
});
