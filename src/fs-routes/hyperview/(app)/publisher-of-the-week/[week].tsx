import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { hyperview } from "../../../../lib/hxml";
import { View } from "../../../../lib/hxml-comps";
import { AppLayout } from "../../+layout";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getUser } from "../../../../utils";
import { weekParamSchema } from "../../../../features/app/schema";
import { getPublisherOfTheWeekForDateQuery } from "../../../../features/app/POTWServices";
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

  const [potwError, publisherOfTheWeek] =
    await getPublisherOfTheWeekForDateQuery(weekStart);
  if (potwError) {
    return hv(
      <ErrorScreen
        user={user}
        baseUrl={baseUrl}
        message="Publisher of the week not found."
      />,
      404,
    );
  }

  const { creator } = publisherOfTheWeek;

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
  const title = `${capitalize(creator.type)} of the Week — ${creator.displayName}`;

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
          editorial={publisherOfTheWeek.instagramCaption?.trim() || null}
          publishedInterview={publishedInterview}
          books={booksResult.books}
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[booksResult.creator.id] ?? false}
          favoritesByBookId={favoritesByBookId}
          spotlightImage={publisherOfTheWeek.instagramImageUrl}
        />
      </View>
    </AppLayout>,
  );
});
