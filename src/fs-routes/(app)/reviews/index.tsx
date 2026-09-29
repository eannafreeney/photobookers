import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import PageHeader from "../../../components/app/PageHeader";
import InfoPage from "../../../pages/InfoPage";
import ReviewCard from "../../../features/app/components/ReviewCard";
import { listPublishedReviews } from "../../../domain/reviews/services";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo";
import { getUser } from "../../../utils";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const [error, reviews] = await listPublishedReviews();
  if (error) return c.html(<InfoPage errorMessage={error.reason} user={user} />);

  const description = truncateDescription(
    "Reviews of photobooks written by collectors and reviewers on photobookers.",
  );

  return c.html(
    <AppLayout
      title={pageTitle("Reviews")}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/reviews")}
      currentPath={c.req.path}
      user={user}
    >
      <Page>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <PageHeader
            kicker="On photobookers"
            title="Reviews"
            intro="Pieces written here by collectors and reviewers. Press links from other sites stay on the press page."
          />
          <p>
            <a
              href="/reviews/copies"
              class="text-sm text-accent underline underline-offset-2"
            >
              Books available for review
            </a>
          </p>
          {reviews.length === 0 ? (
            <p class="border-t border-outline pt-8 text-on-surface">
              No reviews yet.
            </p>
          ) : (
            <ul class="flex flex-col gap-4 border-t border-outline pt-8">
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
