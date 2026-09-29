import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import ReviewCard from "../../../features/app/components/ReviewCard";
import { getReviewerBySlug } from "../../../domain/reviews/services";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo";
import { getUser } from "../../../utils";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const user = await getUser(c);
  const [error, result] = await getReviewerBySlug(slug);
  if (error || !result) {
    return c.html(
      <InfoPage errorMessage={error?.reason ?? "Reviewer not found"} user={user} />,
      404,
    );
  }

  const { profile, reviews } = result;
  const description = truncateDescription(
    profile.bio || `Reviews by ${profile.displayName} on photobookers.`,
  );

  return c.html(
    <AppLayout
      title={pageTitle(profile.displayName)}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, `/reviewers/${profile.slug}`)}
      currentPath={c.req.path}
      user={user}
    >
      <Page>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <header class="flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6">
            <span class="kicker text-accent">Reviewer</span>
            <h1 class="font-display text-4xl font-medium text-on-surface-strong md:text-6xl">
              {profile.displayName}
            </h1>
            {profile.bio ? (
              <p class="max-w-2xl text-sm text-on-surface">{profile.bio}</p>
            ) : null}
            {profile.website ? (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-accent underline underline-offset-2"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </header>
          {reviews.length === 0 ? (
            <p class="text-on-surface">No reviews yet.</p>
          ) : (
            <ul class="flex flex-col gap-4">
              {reviews.map((review) => (
                <ReviewCard review={review} />
              ))}
            </ul>
          )}
        </div>
      </Page>
    </AppLayout>,
  );
});
