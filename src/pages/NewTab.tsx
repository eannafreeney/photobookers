import { AuthUser } from "../../types";
import Avatar from "../components/app/Avatar";
import Badge from "../components/app/Badge";
import Button from "../components/app/Button";
import Card from "../components/app/Card";
import CollectionButton from "../components/app/CollectionButton";
import GridPanel from "../components/app/GridPanel";
import Link from "../components/app/Link";
import SectionTitle from "../components/app/SectionTitle";
import WishlistButton from "../components/app/WishlistButton";
import { Book, Creator } from "../db/schema";
import { canAddToCollection, canWishlistBook } from "../lib/permissions";
import { getNewBooks } from "../services/books";
import { capitalize, formatDate } from "../utils";

const NewTab = async ({ user }: { user: AuthUser }) => {
  const featuredBooks = await getNewBooks();
  if (!featuredBooks) {
    return <div>No featured books found</div>;
  }

  return (
    <div id="tab-content">
      <GridPanel isFullWidth>
        {featuredBooks.map((book: Book & { artist: Creator | null }) => (
          <NewBookCard book={book} artist={book.artist} user={user} />
        ))}
      </GridPanel>
    </div>
  );
};

export default NewTab;

type NewBookCardProps = {
  book: Book;
  artist: Creator;
  user: AuthUser;
};

const NewBookCard = ({ book, artist, user }: NewBookCardProps) => {
  return (
    <Card>
      <div class="p-2">
        <div class="flex items-center justify-between gap-2">
          <Link href={`/creators/${artist.slug}`}>
            <div class="flex items-center gap-2">
              <Avatar
                src={artist.coverUrl ?? ""}
                alt={artist.displayName ?? ""}
                size="xs"
              />
              <Card.SubTitle>{artist?.displayName}</Card.SubTitle>
            </div>
          </Link>
          {book.tags?.length && book.tags?.length > 0 ? (
            <Badge variant="default">{capitalize(book.tags?.[0])}</Badge>
          ) : null}
        </div>
      </div>
      <Card.Image src={book.coverUrl ?? ""} alt={book.title} />
      <Card.Body>
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col gap-2">
            <Card.Title>{book.title}</Card.Title>
            <Card.SubTitle>{book.tagline ?? ""}</Card.SubTitle>
          </div>
        </div>
        <div class="mt-auto flex items-center gap-2">
          <Link href={`/books/${book.slug}`} className="flex-1">
            <Button variant="solid" color="primary">
              <span>More</span>
            </Button>
          </Link>
          <WishlistButton
            isCircleButton
            book={book}
            user={user}     
          />
          <CollectionButton
            isCircleButton
            book={book}
            user={user}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

const rightIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>

)