import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import Table from "../../../../components/app/Table";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import PublishToggleForm from "./PublishToggleForm";
import PreviewButton from "../../../api/components/PreviewButton";
import DeleteBookForm from "./BookDeleteForm";

type Props = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser;
  targetId: string;
  alpineAttrs: any;
};

const PublisherBooksTable = ({ books, user, targetId, alpineAttrs }: Props) => {
  return (
    <Table id="books-table">
      <Table.Head>
        <tr>
          <Table.HeadRow>Cover</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Artist</Table.HeadRow>
          <Table.HeadRow>Created By</Table.HeadRow>
          <Table.HeadRow>Release Date</Table.HeadRow>
          <Table.HeadRow>Publish</Table.HeadRow>
        </tr>
      </Table.Head>
      <Table.Body id={targetId} {...alpineAttrs}>
        {books.map((book) => (
          <PublisherTableRow book={book} user={user} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default PublisherBooksTable;

type PublisherTableRowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser;
};

const PublisherTableRow = ({ book, user }: PublisherTableRowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  const formattedReleaseDate = book.releaseDate
    ? book.releaseDate.toISOString().slice(0, 10).split("-").reverse().join("/")
    : "";

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
        {book.coverUrl ? (
          <Link
            href={
              book.publicationStatus === "published"
                ? `/books/${book.slug}`
                : `/books/preview/${book.slug}`
            }
          >
            {book.title}
          </Link>
        ) : (
          <span>{book.title}</span>
        )}
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        {book.createdByUserId === user.creator?.id
          ? (user.creator?.displayName ?? "")
          : (book.artist?.displayName ?? "")}
      </Table.BodyRow>
      <Table.BodyRow>{formattedReleaseDate}</Table.BodyRow>
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
