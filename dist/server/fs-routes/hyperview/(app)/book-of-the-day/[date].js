import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator.js";
import { hyperview } from "../../../../lib/hxml.js";
import { View } from "../../../../lib/hxml-comps.js";
import { AppLayout } from "../../+layout.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getUser } from "../../../../utils.js";
import { dateParamSchema } from "../../../../features/app/schema.js";
import { getBookOfTheDayForDate } from "../../../../features/app/BOTDServices.js";
import { getBookBySlug } from "../../../../features/app/services.js";
import BookOfTheDaySpotlightBody, {
  bookOfTheDaySpotlightPageStyles
} from "../../../../features/hyperview/components/spotlight/BookOfTheDaySpotlightBody.js";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen.js";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators
} from "../../../../features/hyperview/findFlags.js";
import { formatOrdinalDate } from "../../../../lib/utils.js";
const GET = createRoute(paramValidator(dateParamSchema), async (c) => {
  const date = c.req.valid("param").date;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [botdError, bookOfTheDay] = await getBookOfTheDayForDate(date);
  if (botdError) {
    return hv(
      /* @__PURE__ */ jsx(
        ErrorScreen,
        {
          user,
          baseUrl,
          message: "Book of the day not found."
        }
      ),
      404
    );
  }
  const [bookError, bookResult] = await getBookBySlug(
    bookOfTheDay.book.slug,
    "published"
  );
  if (bookError || !bookResult) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Book not found." }),
      404
    );
  }
  const { book } = bookResult;
  const galleryImages = [
    book.coverUrl,
    ...book.images?.map((image) => image.imageUrl) ?? []
  ].filter((url) => url !== null);
  const creators = [book.artist, book.publisher].filter(
    (creator) => Boolean(creator)
  );
  const [favoritesByBookId, followingByCreatorId] = await Promise.all([
    favoriteFlagsForBooks(user, [book]),
    followFlagsForCreators(user, creators)
  ]);
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: `Book of the Day \u2014 ${formatOrdinalDate(date)}`,
        baseUrl,
        user,
        showDock: true,
        fixedHeader: true,
        extraStyles: bookOfTheDaySpotlightPageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(
          BookOfTheDaySpotlightBody,
          {
            book,
            galleryImages,
            date,
            editorial: bookOfTheDay.instagramCaption?.trim() || null,
            baseUrl,
            isFavorited: favoritesByBookId[book.id] ?? false,
            followingByCreatorId
          }
        ) })
      }
    )
  );
});
export {
  GET
};
