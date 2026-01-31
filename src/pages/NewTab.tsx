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
      <SectionTitle>New</SectionTitle>
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
          <div class="min-w-0 flex-1">
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
            bookId={book.id}
            user={user}
            isDisabled={!canWishlistBook(user, book)}
          />
          <CollectionButton
            isCircleButton
            bookId={book.id}
            user={user}
            isDisabled={!canAddToCollection(user, book)}
          />
        </div>
      </Card.Body>
    </Card>
  );
};
