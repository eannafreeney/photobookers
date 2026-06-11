import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import CreatorOfTheWeekDetail from "../../../features/app/components/CreatorOfTheWeekDetail";
import { aotwPath } from "../../../features/app/spotlightUrls";
import { weekParamSchema } from "../../../features/app/schema";
import { getArtistOfTheWeekForDateQuery } from "../../../features/app/AOTWServices";
import {
  getBooksByCreatorSlug,
  getInterviewByCreatorSlug,
} from "../../../features/app/services";
import {
  canonicalUrl,
  creatorDescription,
  pageTitle,
  truncateDescription,
} from "../../../lib/seo";
import Button from "../../../components/app/Button";

const SPOTLIGHT_BOOKS_LIMIT = 500;

export const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const user = await getUser(c);
  const weekStart = c.req.valid("param").week;
  const currentPath = c.req.path;

  const [aotwError, artistOfTheWeek] =
    await getArtistOfTheWeekForDateQuery(weekStart);
  if (aotwError) {
    return c.html(
      <InfoPage errorMessage="Artist of the week not found" user={user} />,
      404,
    );
  }

  const { creator } = artistOfTheWeek;

  const [booksError, booksResult] = await getBooksByCreatorSlug(
    creator.slug,
    1,
    "newest",
    SPOTLIGHT_BOOKS_LIMIT,
  );
  if (booksError) {
    return c.html(
      <InfoPage errorMessage={booksError.reason} user={user} />,
      404,
    );
  }

  const [interviewError, interview] = await getInterviewByCreatorSlug(
    creator.slug,
  );
  const publishedInterview =
    !interviewError && interview && interview.status === "published"
      ? interview
      : null;

  const path = aotwPath(weekStart);
  const title = pageTitle(`Artist of the Week — ${creator.displayName}`);
  const interviewTeaser = publishedInterview?.answers?.q1?.trim();
  const description = truncateDescription(
    interviewTeaser ?? creatorDescription(creator),
  );
  const shareImage =
    artistOfTheWeek.instagramImageUrl ??
    publishedInterview?.promoImageUrl ??
    creator.bannerUrl ??
    creator.coverUrl ??
    booksResult.books[0]?.coverUrl ??
    undefined;

  if (!user) {
    c.header("Vary", "Cookie");
    c.header(
      "Cache-Control",
      "private, max-age=120, stale-while-revalidate=600",
    );
  } else {
    c.header("Cache-Control", "private, no-store");
  }

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, path)}
      user={user}
      currentPath={currentPath}
      adminEditHref={`/dashboard/admin/creators/${creator.id}`}
      shareOg={{
        title,
        description,
        image: shareImage,
        url: canonicalUrl(c.req.url, path),
      }}
    >
      <Page>
        <CreatorOfTheWeekDetail
          creator={booksResult.creator}
          user={user}
          weekStart={weekStart}
          publishedInterview={publishedInterview}
          books={booksResult.books}
        />
        <a href={`/artist-of-the-week`}>
          <Button variant="outline" color="primary" width="full">
            ← All Artists of the Week
          </Button>
        </a>
      </Page>
    </AppLayout>,
  );
});
