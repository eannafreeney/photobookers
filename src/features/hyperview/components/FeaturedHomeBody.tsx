import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import BookCard from "./BookCard";
import { View } from "../../../lib/hxml-comps";
import {
  getRecentBooksOfTheDay,
  getTodaysBookOfTheDay,
} from "../../app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import CreatorCard from "./CreatorCard";
import { favoriteFlagsForBooks, followFlagsForCreators } from "../findFlags";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody: FC<Props> = async ({ baseUrl, user = null }) => {
  const [
    [botdErr, botdResult],
    [recentBotdErr, recentBotdResult],
    [artistErr, artistResult],
    [publisherErr, publisherResult],
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getRecentBooksOfTheDay(1),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);
  if (artistErr) return <></>;
  if (publisherErr) return <></>;

  const botdBook = botdErr ? null : (botdResult?.book ?? null);
  const todayBookId = botdBook?.id;

  const recentBooks =
    !recentBotdErr && recentBotdResult
      ? recentBotdResult.botdEntries
          .map((entry) => entry.book)
          .filter((book): book is NonNullable<typeof book> => Boolean(book))
          .filter((book) => book.id !== todayBookId)
      : [];

  const books = [botdBook, ...recentBooks].filter(
    (book): book is NonNullable<typeof book> => Boolean(book),
  );
  const featuredCreators = [
    artistResult?.creator,
    publisherResult?.creator,
  ].filter(Boolean);

  const [favoritesByBookId, followingByCreatorId] = await Promise.all([
    favoriteFlagsForBooks(user, books),
    followFlagsForCreators(user, featuredCreators),
  ]);

  return (
    <View>
      {botdBook && (
        <BookCard
          title="Book of The Day"
          book={botdBook}
          baseUrl={baseUrl}
          isFavorited={favoritesByBookId[botdBook.id] ?? false}
        />
      )}
      {artistResult?.creator && (
        <CreatorCard
          showHeader
          title="Artist of The Week"
          creator={artistResult.creator}
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[artistResult.creator.id] ?? false}
        />
      )}
      {publisherResult?.creator && (
        <CreatorCard
          showHeader
          title="Publisher of The Week"
          creator={publisherResult.creator}
          baseUrl={baseUrl}
          isFollowing={
            followingByCreatorId[publisherResult.creator.id] ?? false
          }
        />
      )}
      {recentBooks.length > 0 &&
        recentBooks.map((book) => (
          <BookCard
            title="Recent Book of The Day"
            book={book}
            baseUrl={baseUrl}
            isFavorited={favoritesByBookId[book.id] ?? false}
          />
        ))}
    </View>
  );
};

export default FeaturedHomeBody;
