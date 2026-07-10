import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { hyperview } from "../../../../lib/hxml";
import { View } from "../../../../lib/hxml-comps";
import { AppLayout } from "../../+layout";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getUser } from "../../../../utils";
import { weekParamSchema } from "../../../../features/app/schema";
import { getArtistOfTheWeekForDateQuery } from "../../../../features/app/AOTWServices";
import {
  getBooksByCreatorSlug,
  getInterviewByCreatorSlug,
} from "../../../../features/app/services";
import CreatorOfTheWeekSpotlightBody, {
  creatorOfTheWeekSpotlightPageStyles,
} from "../../../../features/hyperview/components/spotlight/CreatorOfTheWeekSpotlightBody";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators,
} from "../../../../features/hyperview/findFlags";
import { capitalize } from "../../../../utils";

const SPOTLIGHT_BOOKS_LIMIT = 500;

async function fetchPublishedInterview(slug: string) {
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error || !interview || interview.status !== "published") return null;
  return interview;
}

export const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const weekStart = c.req.valid("param").week;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [aotwError, artistOfTheWeek] =
    await getArtistOfTheWeekForDateQuery(weekStart);
  if (aotwError) {
    return hv(
      <ErrorScreen
        user={user}
        baseUrl={baseUrl}
        message="Artist of the week not found."
      />,
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
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={booksError.reason} />,
      404,
    );
  }

  const publishedInterview = await fetchPublishedInterview(creator.slug);
  const title = `${capitalize(creator.type)} of the Week`;

  const [favoritesByBookId, followingByCreatorId] = await Promise.all([
    favoriteFlagsForBooks(user, booksResult.books),
    followFlagsForCreators(user, [booksResult.creator]),
  ]);

  return hv(
    <AppLayout
      title={title}
      baseUrl={baseUrl}
      user={user}
      showDock
      fixedHeader
      extraStyles={creatorOfTheWeekSpotlightPageStyles()}
    >
      <View style="page-content">
        <CreatorOfTheWeekSpotlightBody
          creator={booksResult.creator}
          weekStart={weekStart}
          publishedInterview={publishedInterview}
          books={booksResult.books}
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[booksResult.creator.id] ?? false}
          favoritesByBookId={favoritesByBookId}
          spotlightImage={artistOfTheWeek.featuredImageUrl}
          spotlightBlurb={artistOfTheWeek.spotlightBlurb}
        />
      </View>
    </AppLayout>,
  );
});
