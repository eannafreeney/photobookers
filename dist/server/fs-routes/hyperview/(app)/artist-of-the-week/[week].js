import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator.js";
import { hyperview } from "../../../../lib/hxml.js";
import { View } from "../../../../lib/hxml-comps.js";
import { AppLayout } from "../../+layout.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getUser } from "../../../../utils.js";
import { weekParamSchema } from "../../../../features/app/schema.js";
import { getArtistOfTheWeekForDateQuery } from "../../../../features/app/AOTWServices.js";
import {
  getBooksByCreatorSlug,
  getInterviewByCreatorSlug
} from "../../../../features/app/services.js";
import CreatorOfTheWeekSpotlightBody, {
  creatorOfTheWeekSpotlightPageStyles
} from "../../../../features/hyperview/components/spotlight/CreatorOfTheWeekSpotlightBody.js";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen.js";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators
} from "../../../../features/hyperview/findFlags.js";
import { capitalize } from "../../../../utils.js";
const SPOTLIGHT_BOOKS_LIMIT = 500;
async function fetchPublishedInterview(slug) {
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error || !interview || interview.status !== "published") return null;
  return interview;
}
const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const weekStart = c.req.valid("param").week;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [aotwError, artistOfTheWeek] = await getArtistOfTheWeekForDateQuery(weekStart);
  if (aotwError) {
    return hv(
      /* @__PURE__ */ jsx(
        ErrorScreen,
        {
          user,
          baseUrl,
          message: "Artist of the week not found."
        }
      ),
      404
    );
  }
  const { creator } = artistOfTheWeek;
  const [booksError, booksResult] = await getBooksByCreatorSlug(
    creator.slug,
    1,
    "newest",
    SPOTLIGHT_BOOKS_LIMIT
  );
  if (booksError) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: booksError.reason }),
      404
    );
  }
  const publishedInterview = await fetchPublishedInterview(creator.slug);
  const title = `${capitalize(creator.type)} of the Week`;
  const [favoritesByBookId, followingByCreatorId] = await Promise.all([
    favoriteFlagsForBooks(user, booksResult.books),
    followFlagsForCreators(user, [booksResult.creator])
  ]);
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        baseUrl,
        user,
        showDock: true,
        fixedHeader: true,
        extraStyles: creatorOfTheWeekSpotlightPageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(
          CreatorOfTheWeekSpotlightBody,
          {
            creator: booksResult.creator,
            weekStart,
            publishedInterview,
            books: booksResult.books,
            baseUrl,
            isFollowing: followingByCreatorId[booksResult.creator.id] ?? false,
            favoritesByBookId,
            spotlightImage: artistOfTheWeek.instagramImageUrl
          }
        ) })
      }
    )
  );
});
export {
  GET
};
