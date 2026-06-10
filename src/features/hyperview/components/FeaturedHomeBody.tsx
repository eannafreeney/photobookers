import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import BookCard from "./BookCard";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";
import { getTodaysBookOfTheDay } from "../../app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import CreatorCard from "./CreatorCard";
import Interviews from "./Interviews";
import NewsletterCard from "./NewsletterCard";
import { favoriteFlagsForBooks, followFlagsForCreators } from "../findFlags";
import LazyLoader from "./LazyLoader";
import { botdPath, aotwPath, potwPath } from "../../app/spotlightUrls";
import { toWeekString, toWeekStart } from "../../../lib/utils";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles,
} from "./SecondaryButtonLink";

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

  const weekStart = toWeekStart(new Date());
  const thisWeekHref = `${baseUrl}/hyperview/this-week?week=${toWeekString(weekStart)}`;

  return (
    <View>
      <SecondaryButtonLink label="View this week →" href={thisWeekHref} />

      {botdBook && botdResult ? (
        <BookCard
          title="Book of The Day"
          book={botdBook}
          baseUrl={baseUrl}
          isFavorited={favoritesByBookId[botdBook.id] ?? false}
          detailHref={`${baseUrl}/hyperview${botdPath(botdResult.date)}`}
        />
      ) : null}
      {artistResult?.creator ? (
        <CreatorCard
          showHeader
          title="Artist of The Week"
          creator={artistResult.creator}
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[artistResult.creator.id] ?? false}
          profileHref={`${baseUrl}/hyperview${aotwPath(artistResult.weekStart)}`}
        />
      ) : null}
      {publisherResult?.creator ? (
        <CreatorCard
          showHeader
          title="Publisher of The Week"
          creator={publisherResult.creator}
          baseUrl={baseUrl}
          isFollowing={
            followingByCreatorId[publisherResult.creator.id] ?? false
          }
          profileHref={`${baseUrl}/hyperview${potwPath(publisherResult.weekStart)}`}
        />
      ) : null}
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

export const featuredHomeBodyStyles = () => <>{secondaryButtonLinkStyles()}</>;
