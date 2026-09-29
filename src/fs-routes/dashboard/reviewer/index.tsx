import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout";
import MemberDashboardShell from "../../../features/dashboard/components/MemberDashboardShell";
import PageHeader from "../../../components/app/PageHeader";
import Button from "../../../components/app/Button";
import FormPost from "../../../components/forms/FormPost";
import Link from "../../../components/app/Link";
import { getFlash, getUser, setFlash } from "../../../utils";
import { reviewerProfileSchema } from "../../../domain/reviews/schema";
import {
  getReviewerProfile,
  listMyReviewRequests,
  saveReviewerProfile,
} from "../../../domain/reviews/services";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const profile = (await getReviewerProfile(user.id))[1];
  const requests = (await listMyReviewRequests(user.id))[1] ?? [];

  return c.html(
    <AppLayout title="Reviewer profile" user={user} flash={flash} currentPath={c.req.path}>
      <MemberDashboardShell user={user} currentPath={c.req.path}>
        <PageHeader
          title="Reviewer profile"
          intro="A public page for the books you review. You need this before you can request a review copy."
        />
        <FormPost action="/dashboard/reviewer" className="flex max-w-xl flex-col gap-4">
          <label class="flex flex-col gap-1 text-sm text-on-surface">
            Name
            <input
              name="display_name"
              required
              value={profile?.displayName ?? ""}
              class="rounded-radius border border-outline bg-surface px-2 py-2"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-on-surface">
            URL
            <input
              name="slug"
              required
              value={profile?.slug ?? ""}
              placeholder="your-name"
              class="rounded-radius border border-outline bg-surface px-2 py-2"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-on-surface">
            Bio
            <textarea
              name="bio"
              rows={4}
              class="rounded-radius border border-outline bg-surface px-2 py-2"
            >
              {profile?.bio ?? ""}
            </textarea>
          </label>
          <label class="flex flex-col gap-1 text-sm text-on-surface">
            Website
            <input
              name="website"
              type="url"
              value={profile?.website ?? ""}
              class="rounded-radius border border-outline bg-surface px-2 py-2"
            />
          </label>
          <Button variant="solid" color="primary" width="fit">
            Save profile
          </Button>
        </FormPost>
        {profile ? (
          <p>
            <Link href={`/reviewers/${profile.slug}`} className="text-sm text-accent">
              View your reviewer page
            </Link>
            {" · "}
            <Link href="/reviews/copies" className="text-sm text-accent">
              Browse review copies
            </Link>
          </p>
        ) : null}
        <section class="flex flex-col gap-2">
          <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-on-surface/70">
            Your requests
          </h2>
          {requests.length === 0 ? (
            <p class="text-sm text-on-surface">No review-copy requests yet.</p>
          ) : (
            <ul class="flex flex-col gap-2">
              {requests.map((request) => (
                <li class="text-sm text-on-surface">
                  <Link href={`/books/${request.book.slug}`}>{request.book.title}</Link>
                  {` · ${request.status}`}
                </li>
              ))}
            </ul>
          )}
        </section>
      </MemberDashboardShell>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const user = await getUser(c);
  const parsed = reviewerProfileSchema.safeParse(await c.req.parseBody());
  if (!parsed.success) {
    await setFlash(c, "danger", parsed.error.issues[0]?.message ?? "Check the form");
    return c.redirect("/dashboard/reviewer");
  }
  const [error] = await saveReviewerProfile(user.id, {
    slug: parsed.data.slug,
    displayName: parsed.data.display_name,
    bio: parsed.data.bio,
    website: parsed.data.website,
  });
  await setFlash(c, error ? "danger" : "success", error?.reason ?? "Profile saved");
  return c.redirect("/dashboard/reviewer");
});
