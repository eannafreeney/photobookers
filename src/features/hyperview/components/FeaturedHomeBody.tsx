import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import BookCard from "./BookCard";
import { View } from "../../../lib/hxml-comps";
import { getTodaysBookOfTheDay } from "../../app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import CreatorCard from "./CreatorCard";
import Interviews from "./Interviews";
import NewsletterCard from "./NewsletterCard";
import { favoriteFlagsForBooks, followFlagsForCreators } from "../findFlags";
import LazyLoader from "./LazyLoader";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody: FC<Props> = async ({ baseUrl, user = null }) => {
  const [
    [botdErr, botdResult],
    [artistErr, artistResult],
    [publisherErr, publisherResult],
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);
  if (artistErr) return <></>;
  if (publisherErr) return <></>;

  const botdBook = botdErr ? null : (botdResult?.book ?? null);

  const books = [botdBook].filter((book): book is NonNullable<typeof book> =>
    Boolean(book),
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
      <NewsletterCard baseUrl={baseUrl} />
      <LazyLoader
        id="interviews-fragment"
        href={`${baseUrl}/hyperview/featured/tab/interviews`}
        style="interviews-fragment"
      />
    </View>
  );
};

export default FeaturedHomeBody;
