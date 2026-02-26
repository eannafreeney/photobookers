import TableSearch from "../cms/ui/TableSearch";
import SectionTitle from "../app/SectionTitle";
import Button from "../app/Button";
import Link from "../app/Link";
import Table from "../cms/ui/Table";
import { Book, Creator } from "../../db/schema";
import { AuthUser } from "../../../types";
import PreviewButton from "../api/PreviewButton";
import PublishToggleForm from "../cms/forms/PublishToggleForm";
import DeleteBookForm from "./BookDeleteForm";

type Props = {
  books: Book[];
  user: AuthUser | null;
};

const BooksOverviewDesktop = ({ books, user }: Props) => {
  const alpineAttrs = {
    "x-init": "true",
    "@books:updated.window":
      "$ajax('/dashboard/books', target: 'books-table-body')",
  };

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>My Books</SectionTitle>
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
            <th class="p-4">Cover</th>
            <th class="p-4">Title</th>
            <th class="p-4">Artist</th>
            <th class="p-4">Release Date</th>
            <th class="p-4">Publish</th>
            <th class="p-4"></th>
            <th class="p-4"></th>
            <th class="p-4"></th>
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
  book: Book & { artist: Creator; publisher: Creator };
  user: AuthUser | null;
};

const BookTableRow = ({ book, user }: RowProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return <></>;
  }

  return (
    <tr>
      <td class="p-4">
        {book.coverUrl ? (
          <img src={book.coverUrl ?? ""} alt={book.title} class="w-auto h-12" />
        ) : (
          <a href={`/dashboard/books/edit/${book.id}#book-images`}>
            <Button variant="outline" color="warning">
              <span>Upload Cover</span>
            </Button>
          </a>
        )}
      </td>
      <td class="p-4">{book.title}</td>
      <td class="p-4">
        <a href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </a>
      </td>
      <td class="p-4">
        {book.releaseDate
          ? book.releaseDate
              .toISOString()
              .slice(0, 10)
              .split("-")
              .reverse()
              .join("/")
          : ""}
      </td>
      <td class="p-4">
        <PublishToggleForm book={book} />
      </td>
      <td class="p-4">
        <PreviewButton book={book} user={user} />
      </td>
      <td class="p-4">
        <a href={`/dashboard/books/edit/${book.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td class="p-4">
        <DeleteBookForm book={book} user={user} />
      </td>
    </tr>
  );
};
