import { useUser } from "../../contexts/UserContext";
import { Book, BookOfTheDay, Creator } from "../../db/schema";
import ErrorPage from "../../pages/error/errorPage";
import { getAllBooksAdmin } from "../../services/admin";
import { capitalize, formatDate } from "../../utils";
import PreviewButton from "../api/PreviewButton";
import Button from "../app/Button";
import Link from "../app/Link";
import { Pagination } from "../app/Pagination";
import SectionTitle from "../app/SectionTitle";
import PublishToggleForm from "../cms/forms/PublishToggleForm";
import Table from "../cms/ui/Table";
import TableSearch from "../cms/ui/TableSearch";

type Props = {
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const BooksTable = async ({ searchQuery, currentPage, currentPath }: Props) => {
  const result = await getAllBooksAdmin(currentPage, searchQuery);

  if (!result?.books) {
    return <ErrorPage errorMessage="No featured books found" />;
  }

  const { books, totalPages, page } = result;

  const targetId = "books-table-body";

  const tableAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "book-of-the-day:updated.window": "$ajax('/dashboard/admin/books')",
  };

  return (
    <div class="flex flex-col gap-8">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="books-table"
          action="/dashboard/admin/books"
          placeholder="Filter books..."
        />
      </div>
      <Table id="books-table" {...tableAttrs}>
        <Table.Head>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Publisher</th>
            <th>Release Date</th>
            <th>Approval Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </Table.Head>
        <Table.Body id={targetId}>
          {books.map((book) => (
            <BooksTableRow book={book} />
          ))}
        </Table.Body>
      </Table>
      <Pagination
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};

export default BooksTable;

type BooksTableRowProps = {
  book: Book & {
    artist: Creator;
    publisher: Creator;
    bookOfTheDayEntry: BookOfTheDay;
  };
};

const BooksTableRow = ({ book }: BooksTableRowProps) => {
  const user = useUser();
  return (
    <tr>
      <td class="max-w-48 wrap-break-word">
        <Link href={`/books/${book.slug}`} target="_blank">
          {book.title}
        </Link>
      </td>
      <td class="max-w-48 wrap-break-word">
        <Link href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </Link>
      </td>
      <td class="max-w-48 wrap-break-word">
        <Link href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName}
        </Link>
      </td>
      <td>{book.releaseDate ? formatDate(book.releaseDate) : ""}</td>
      <td>
        {book.approvalStatus === "approved" ? (
          <p class=" text-success">✓</p>
        ) : (
          <p class=" text-danger">✗</p>
        )}
      </td>
      <td>{formatDate(book.createdAt ?? new Date())}</td>
      <td>
        {book.bookOfTheDayEntry ? (
          <p>{formatDate(book.bookOfTheDayEntry.date)}</p>
        ) : (
          <a
            href={`/dashboard/admin/book-of-the-day/${book.id}`}
            x-target="modal-root"
          >
            <Button variant="outline" color="primary">
              <span>Schedule</span>
            </Button>
          </a>
        )}
      </td>

      <td>
        <PreviewButton book={book} user={user} />
      </td>
      <td>
        <PublishToggleForm book={book} />
      </td>
      <td>
        <a href={`/dashboard/admin/books/edit/${book.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td>
        <form
          x-target="books-table toast"
          {...{ "x-target.error": "toast" }}
          method="post"
          action={`/dashboard/admin/books/delete/${book.id}`}
          x-init
          {...{
            "@ajax:before":
              "confirm('Are you sure?') || $event.preventDefault()",
          }}
        >
          <Button variant="outline" color="danger">
            <span>Delete</span>
          </Button>
        </form>
      </td>
    </tr>
  );
};
