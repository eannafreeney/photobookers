import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Spinner, Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { bookIdSchema } from "../../../../../../schemas";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags";
import { getArtistByBookId } from "../../../../../../features/dashboard/books/services";
import {
  BOOK_ARTIST_FEED_ID,
  artistBooksLazyStyles,
} from "./artist-books/[artistId]";
import LazyLoader from "../../../../../../features/hyperview/components/LazyLoader";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, book] = await getArtistByBookId(bookId);

  if (error || !book?.artist) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  const { artistId, artist } = book;
  const followingByCreatorId = await followFlagsForCreators(user, [artist]);
  const booksHref = `${baseUrl}/hyperview/books/${bookId}/tab/artist-books/${artistId}`;

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <CreatorCard
        creator={artist}
        baseUrl={baseUrl}
        showHeader={false}
        isFollowing={followingByCreatorId[artist.id] ?? false}
      />
      {/* <Text style="artist-name">Books by {artist.displayName}</Text> */}
      <LazyLoader
        id={BOOK_ARTIST_FEED_ID}
        href={booksHref}
        style="artist-books-lazy"
      />
    </view>,
  );
});

export const artistTabStyles = () => artistBooksLazyStyles();
