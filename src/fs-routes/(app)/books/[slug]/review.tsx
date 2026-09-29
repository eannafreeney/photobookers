import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { paramValidator } from "../../../../lib/validator";
import { slugSchema } from "../../../../features/app/schema";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import PageHeader from "../../../../components/app/PageHeader";
import InfoPage from "../../../../pages/InfoPage";
import Button from "../../../../components/app/Button";
import FormPost from "../../../../components/forms/FormPost";
import { getFlash, getUser, setFlash } from "../../../../utils";
import { reviewFormSchema } from "../../../../domain/reviews/schema";
import {
  deleteReview,
  getMyReviewForBook,
  saveReview,
} from "../../../../domain/reviews/services";
import { isBookCreator } from "../../../../domain/reviews/policy";
import { getBookBySlug } from "../../../../features/app/services";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const user = await getUser(c);
  if (!user?.id) {
    return c.redirect(`/auth/login?redirectUrl=${encodeURIComponent(c.req.path)}`);
  }
  const [bookErr, result] = await getBookBySlug(slug, "published");
  if (bookErr || !result) {
    return c.html(<InfoPage errorMessage={bookErr?.reason ?? "Book not found"} user={user} />, 404);
  }
  const { book } = result;
  if (
    isBookCreator(user.id, {
      artistOwnerUserId: book.artist?.ownerUserId,
      publisherOwnerUserId: book.publisher?.ownerUserId,
    })
  ) {
    return c.html(<InfoPage errorMessage="You can't review your own book" user={user} />, 403);
  }
  const existing = await getMyReviewForBook(user.id, book.id);
  const flash = await getFlash(c);

  return c.html(
    <AppLayout title={`Review ${book.title}`} user={user} flash={flash} currentPath={c.req.path}>
      <Page>
        <div class="mx-auto flex w-full max-w-xl flex-col gap-6">
          <PageHeader
            kicker="Review"
            title={existing ? "Edit your review" : "Write a review"}
            intro={book.title}
          />
          <FormPost action={`/books/${book.slug}/review`} className="flex flex-col gap-4">
            <label class="flex flex-col gap-1 text-sm text-on-surface">
              Title
              <input
                name="title"
                required
                value={existing?.title ?? ""}
                class="rounded-radius border border-outline bg-surface px-2 py-2 text-on-surface"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm text-on-surface">
              Review
              <textarea
                name="body"
                required
                rows={8}
                class="rounded-radius border border-outline bg-surface px-2 py-2 text-on-surface"
              >
                {existing?.body ?? ""}
              </textarea>
            </label>
            <label class="flex flex-col gap-1 text-sm text-on-surface">
              Also published at (optional)
              <input
                name="external_url"
                type="url"
                value={existing?.externalUrl ?? ""}
                class="rounded-radius border border-outline bg-surface px-2 py-2 text-on-surface"
              />
            </label>
            <Button variant="solid" color="primary" width="fit">
              {existing ? "Update review" : "Publish review"}
            </Button>
          </FormPost>
          {existing ? (
            <FormPost action={`/books/${book.slug}/review/delete`}>
              <Button variant="outline" color="danger" width="fit">
                Delete review
              </Button>
            </FormPost>
          ) : null}
        </div>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(paramValidator(slugSchema), async (c: Context) => {
  const slug = c.req.param("slug") ?? "";
  const user = await getUser(c);
  if (!user?.id) return c.redirect("/auth/login");
  const body = await c.req.parseBody();
  const parsed = reviewFormSchema.safeParse(body);
  if (!parsed.success) {
    await setFlash(c, "danger", parsed.error.issues[0]?.message ?? "Check the form");
    return c.redirect(`/books/${slug}/review`);
  }
  const [error] = await saveReview(user.id, slug, {
    title: parsed.data.title,
    body: parsed.data.body,
    externalUrl: parsed.data.external_url,
  });
  if (error) {
    await setFlash(c, "danger", error.reason);
    return c.redirect(`/books/${slug}/review`);
  }
  await setFlash(c, "success", "Review published");
  return c.redirect(`/books/${slug}`);
});
