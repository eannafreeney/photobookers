import TableSearch from "../../../../components/app/TableSearch";
import SectionTitle from "../../../../components/app/SectionTitle";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import PreviewButton from "../../../api/components/PreviewButton";
import PublishToggleForm from "./PublishToggleForm";
import DeleteBookForm from "./BookDeleteForm";
import { findCollectionCount, findWishlistCount } from "../../../api/services";
import Card from "../../../../components/app/Card";

type Props = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser;
  totalPages: number;
  page: number;
  creatorType: "artist" | "publisher";
};

const BooksOverviewDesktop = ({
  books,
  user,
  totalPages,
  page,
  creatorType,
}: Props) => {
  const targetId = "books-table-body";

  const alpineAttrs = {
    "x-init": "true",
    "@books:updated.window":
      "$ajax('/dashboard/books', { target: 'books-table-body' })",
  };

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="books-table"
          action="/dashboard/books"
          placeholder="Filter books..."
        />
        <Link href="/dashboard/books/new">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <Table id="books-table">
        <Table.Head>
          <tr>
            <Table.HeadRow>Cover</Table.HeadRow>
            <Table.HeadRow>Title</Table.HeadRow>
            <Table.HeadRow>Artist</Table.HeadRow>
            <Table.HeadRow>Publisher</Table.HeadRow>
            <Table.HeadRow>Wishlists</Table.HeadRow>
            <Table.HeadRow>Collections</Table.HeadRow>
            <Table.HeadRow>Release Date</Table.HeadRow>
            <Table.HeadRow>Publish</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body id="books-table-body" {...alpineAttrs}>
          {books.map((book) => (
            <BookTableRow book={book} user={user} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default BooksOverviewDesktop;

type RowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser | null;
};

const BookTableRow = ({ book, user }: RowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <tr>
      <Table.BodyRow>
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/${book.id}/update#book-images`}>
            <Button variant="outline" color="warning">
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </Table.BodyRow>
      <Table.BodyRow>
        <Link
          href={
            book.publicationStatus === "published"
              ? `/books/${book.slug}`
              : `/books/preview/${book.slug}`
          }
        >
          {book.title}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName ?? ""}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <WishlistCount bookId={book.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        <CollectionCount bookId={book.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        {book.releaseDate
          ? book.releaseDate
              .toISOString()
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/")
          : ""}
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishToggleForm book={book} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PreviewButton book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a href={`/dashboard/books/${book.id}/update`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteBookForm book={book} user={user} />
      </Table.BodyRow>
    </tr>
  );
};

const WishlistCount = async ({ bookId }: { bookId: string }) => {
  const wishlistCount = await findWishlistCount(bookId);
  return <Card.Text>{wishlistCount.toString() ?? "0"}</Card.Text>;
};

const CollectionCount = async ({ bookId }: { bookId: string }) => {
  const collectionCount = await findCollectionCount(bookId);
  return <Card.Text>{collectionCount.toString() ?? "0"}</Card.Text>;
};
