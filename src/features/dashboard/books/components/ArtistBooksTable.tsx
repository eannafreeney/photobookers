import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import Table from "../../../../components/app/Table";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import CreatorStatusBadge from "../../admin/components/CreatorStatusBadge";
import PublishToggleForm from "./PublishToggleForm";
import PreviewButton from "../../../api/components/PreviewButton";
import DeleteBookForm from "./BookDeleteForm";

type Props = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser;
  targetId: string;
  alpineAttrs: any;
};

const ArtistBooksTable = ({ books, user, targetId, alpineAttrs }: Props) => {
  return (
    <Table id="books-table">
      <Table.Head>
        <tr>
          <Table.HeadRow>Cover</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Artist</Table.HeadRow>
          <Table.HeadRow>Publisher</Table.HeadRow>
          <Table.HeadRow>Publisher Status</Table.HeadRow>
          <Table.HeadRow>Release Date</Table.HeadRow>
          <Table.HeadRow>Publish</Table.HeadRow>
        </tr>
      </Table.Head>
      <Table.Body id={targetId} {...alpineAttrs}>
        {books.map((book) => (
          <ArtistTableRow book={book} user={user} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default ArtistBooksTable;

type ArtistTableRowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser;
};

const ArtistTableRow = ({ book, user }: ArtistTableRowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  const publisherIsVerified = book?.publisher?.status === "verified";

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
        {book.publisher && (
          <Link href={`/creators/${book.publisher?.slug}`}>
            {book.publisher.displayName}
          </Link>
        )}
      </Table.BodyRow>
      <Table.BodyRow>
        {book.publisher && (
          <CreatorStatusBadge creatorStatus={book.publisher.status ?? "stub"} />
        )}
      </Table.BodyRow>
      <Table.BodyRow>{formattedReleaseDate}</Table.BodyRow>
      <Table.BodyRow>
        {!publisherIsVerified && <PublishToggleForm book={book} />}
      </Table.BodyRow>
      <Table.BodyRow>
        {!publisherIsVerified && <PreviewButton book={book} user={user} />}
      </Table.BodyRow>
      {!publisherIsVerified && (
        <>
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
        </>
      )}
    </tr>
  );
};
