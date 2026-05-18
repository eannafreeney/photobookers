import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import BookCard from "./BookCard";
import { likeFlagsForBooks } from "../likeFlags";
import { View } from "../../../lib/hxml-comps";
import { getThisWeeksBookOfTheWeek } from "../../app/BOTWServices";
import { getThisWeeksFeaturedBooks } from "../../app/FeaturedServices";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody: FC<Props> = async ({ baseUrl, user = null }) => {
  const [err, result] = await getThisWeeksBookOfTheWeek();
  const [error, featuredBooks] = await getThisWeeksFeaturedBooks();
  if (err) return <></>;
  if (error) return <></>;

  const books = [
    result?.book,
    ...featuredBooks?.featuredBooks.map((fb) => fb.book),
  ].filter(Boolean);

  const likesByBookId = await likeFlagsForBooks(user, books);

  return (
    <View>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          user={user}
          isLiked={likesByBookId[book.id] ?? false}
        />
      ))}
    </View>
  );
};

export default FeaturedHomeBody;
