import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { hyperview } from "../../../../lib/hxml";
import { View } from "../../../../lib/hxml-comps";
import { AppLayout } from "../../+layout";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getUser } from "../../../../utils";
import { dateParamSchema } from "../../../../features/app/schema";
import { getBookOfTheDayForDate } from "../../../../features/app/BOTDServices";
import { getBookBySlug } from "../../../../features/app/services";
import BookOfTheDaySpotlightBody, {
  bookOfTheDaySpotlightPageStyles,
} from "../../../../features/hyperview/components/spotlight/BookOfTheDaySpotlightBody";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators,
} from "../../../../features/hyperview/findFlags";
import { formatOrdinalDate } from "../../../../lib/utils";

export const GET = createRoute(paramValidator(dateParamSchema), async (c) => {
  const date = c.req.valid("param").date;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [botdError, bookOfTheDay] = await getBookOfTheDayForDate(date);
  if (botdError) {
    return hv(
      <ErrorScreen
        user={user}
        baseUrl={baseUrl}
        message="Book of the day not found."
      />,
      404,
    );
  }

  const [bookError, bookResult] = await getBookBySlug(
    bookOfTheDay.book.slug,
    "published",
  );
  if (bookError || !bookResult) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Book not found." />,
      404,
    );
  }

  const { book } = bookResult;
  const galleryImages = [
    book.coverUrl,
    ...(book.images?.map((image) => image.imageUrl) ?? []),
  ].filter((url): url is string => url !== null);

  const creators = [book.artist, book.publisher].filter(
    (creator): creator is NonNullable<typeof book.artist> => Boolean(creator),
  );
  const [favoritesByBookId, followingByCreatorId] = await Promise.all([
    favoriteFlagsForBooks(user, [book]),
    followFlagsForCreators(user, creators),
  ]);

  return hv(
    <AppLayout
      title={`Book of the Day — ${formatOrdinalDate(date)}`}
      baseUrl={baseUrl}
      user={user}
      showDock
      fixedHeader
      extraStyles={bookOfTheDaySpotlightPageStyles()}
    >
      <View style="page-content">
        <BookOfTheDaySpotlightBody
          book={book}
          galleryImages={galleryImages}
          date={date}
          spotlightBlurb={bookOfTheDay.spotlightBlurb}
          baseUrl={baseUrl}
          isFavorited={favoritesByBookId[book.id] ?? false}
          followingByCreatorId={followingByCreatorId}
        />
      </View>
    </AppLayout>,
  );
});
