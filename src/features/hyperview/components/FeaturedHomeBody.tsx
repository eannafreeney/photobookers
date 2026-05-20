import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import BookCard from "./BookCard";
import { View } from "../../../lib/hxml-comps";
import { getThisWeeksBookOfTheWeek } from "../../app/BOTWServices";
import { getThisWeeksFeaturedBooks } from "../../app/FeaturedServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import CreatorCard from "./CreatorCard";
import { wishlistFlagsForBooks } from "../findFlags";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody: FC<Props> = async ({ baseUrl, user = null }) => {
  const [
    [botwErr, botwResult],
    [featuredBooksErr, featuredBooksResult],
    [artistErr, artistResult],
    [publisherErr, publisherResult],
  ] = await Promise.all([
    getThisWeeksBookOfTheWeek(),
    getThisWeeksFeaturedBooks(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);
  if (botwErr) return <></>;
  if (featuredBooksErr) return <></>;
  if (artistErr) return <></>;
  if (publisherErr) return <></>;

  const botwBook = botwResult?.book ?? null;
  const featuredBooksOnly =
    featuredBooksResult?.featuredBooks.map((fb) => fb.book).filter(Boolean) ??
    [];

  const books = [botwBook, ...featuredBooksOnly].filter(Boolean);
  const wishlistsByBookId = await wishlistFlagsForBooks(user, books);

  return (
    <View>
      {botwBook && (
        <BookCard
          title="Book of The Week"
          book={botwBook}
          baseUrl={baseUrl}
          isWishlisted={wishlistsByBookId[botwBook.id] ?? false}
        />
      )}
      {artistResult?.creator && (
        <CreatorCard
          showHeader
          title="Artist of The Week"
          creator={artistResult.creator}
          baseUrl={baseUrl}
        />
      )}
      {publisherResult?.creator && (
        <CreatorCard
          showHeader
          title="Publisher of The Week"
          creator={publisherResult.creator}
          baseUrl={baseUrl}
        />
      )}
      {featuredBooksOnly.length > 0 &&
        featuredBooksOnly.map((book) => (
          <BookCard
            title="Featured"
            book={book}
            baseUrl={baseUrl}
            isWishlisted={wishlistsByBookId[book.id] ?? false}
          />
        ))}
    </View>
  );
};

export default FeaturedHomeBody;
