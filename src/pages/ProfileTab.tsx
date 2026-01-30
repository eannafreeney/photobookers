import { AuthUser } from "../../types";
import Avatar from "../components/app/Avatar";
import Button from "../components/app/Button";
import Card from "../components/app/Card";
import GridPanel from "../components/app/GridPanel";
import Link from "../components/app/Link";
import SectionTitle from "../components/app/SectionTitle";
import { Book, Creator } from "../db/schema";
import { getBooksInCollection, getBooksInWishlist } from "../services/books";
import { formatDate } from "../utils";

type Props = {
  user: AuthUser | null;
};

const ProfileTab = async ({ user }: Props) => {
  if (!user) {
    return (
      <>
        <div id="tab-content">
          <SectionTitle>Your Feed</SectionTitle>
          <p>
            See the latest releases from your favorite artists and publishers.
          </p>
          <div class="flex flex-col md:flex-row justify-center items-center gap-4 border rounded-radius p-4">
            <span>Login or register to view your feed.</span>
            <a href="/auth/login">
              <Button variant="solid" color="primary">
                Login
              </Button>
            </a>
            <a href="/auth/register">
              <Button variant="solid" color="primary">
                Register
              </Button>
            </a>
          </div>
        </div>
      </>
    );
  }

  const wishlistBooks = await getBooksInWishlist(user.id);
  const collectionBooks = await getBooksInCollection(user.id);

  return (
    <div id="tab-content" class="flex flex-col gap-4">
      {wishlistBooks && wishlistBooks.length > 0 && (
        <Collection entity={wishlistBooks} label="Wishlist" />
      )}
      {collectionBooks && collectionBooks.length > 0 && (
        <Collection entity={collectionBooks} label="Collection" />
      )}
    </div>
  );
};

export default ProfileTab;

const Collection = ({
  entity,
  label,
}: {
  entity: Book[] & { artist: Creator };
  label: string;
}) => (
  <div class="relative">
    <span class="absolute -top-2 left-16 rounded-full bg-warning px-[5px] leading-4 text-xs font-medium text-on-danger">
      {entity?.length}
    </span>
    <SectionTitle>{label}</SectionTitle>
    <GridPanel isFullWidth>
      <div>
        {entity?.map((book) => (
          <BookCard book={book} artist={book.artist} />
        ))}
      </div>
    </GridPanel>
  </div>
);

type BookCardProps = {
  book: Book;
  artist: Creator;
};

const BookCard = ({ book, artist }: BookCardProps) => {
  return (
    <Card>
      <Card.Image src={book.coverUrl ?? ""} alt={book.title} />
      <Card.Body>
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
        <div>
          <Card.Title>{book.title}</Card.Title>
          <Card.SubTitle>
            {formatDate(new Date(book.releaseDate ?? "").toISOString())}
          </Card.SubTitle>
        </div>
        <Card.Tags tags={book.tags ?? []} />
        <Link href={`/books/${book.slug}`}>
          <Button variant="solid" color="primary">
            <span>More Info</span>
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};
