import { FC } from "hono/jsx";
import type { BookCardResult } from "../../../constants/queries";
import type { AuthUser } from "../../../../types";
import BookCard from "./BookCard";
import HeroCarousel from "./HeroCarousel";
import NewsletterCard from "./NewsletterCard";
import SectionHeader from "./SectionHeader";

type Props = {
  baseUrl: string;
  books: BookCardResult[];
  user?: AuthUser | null;
  likesByBookId?: Record<string, boolean>;
};

const FeaturedHomeBody: FC<Props> = ({
  baseUrl,
  books,
  user = null,
  likesByBookId = {},
}) => (
  <>
    <HeroCarousel baseUrl={baseUrl} />
    {/* <Interviews baseUrl={baseUrl} /> */}
    <NewsletterCard baseUrl={baseUrl} />
    <SectionHeader
      title="Latest Books"
      viewAllHref={`${baseUrl}/hyperview/books`}
    />
    {books.map((book) => (
      <BookCard
        key={book.id}
        book={book}
        baseUrl={baseUrl}
        user={user}
        isLiked={likesByBookId[book.id] ?? false}
      />
    ))}
  </>
);

export default FeaturedHomeBody;
