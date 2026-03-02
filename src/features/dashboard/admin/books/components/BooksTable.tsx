import { useUser } from "../../../../../contexts/UserContext";
import { Book, BookOfTheWeek, Creator } from "../../../../../db/schema";
import { calendarIcon, editIcon } from "../../../../../lib/icons";
import { toWeekString } from "../../../../../lib/utils";
import { formatDate } from "../../../../../utils";
import PreviewButton from "../../../../api/components/PreviewButton";
import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import { Pagination } from "../../../../../components/app/Pagination";
import SectionTitle from "../../../../../components/app/SectionTitle";
import PublishToggleForm from "../../../books/components/PublishToggleForm";
import Table from "../../../../../components/forms/Table";
import TableSearch from "../../../../../components/forms/TableSearch";
import DeleteFormButton from "../../components/DeleteFormButton";
import { BookWithAdminRelations } from "../types";

type Props = {
  totalPages: number;
  page: number;
  books: BookWithAdminRelations[];
  currentPath: string;
};

const BooksTable = async ({ totalPages, page, books, currentPath }: Props) => {
  const targetId = "books-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@books:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/books', { target: 'books-table-container' })`,
  };

  return (
    <div id="books-table-container" class="flex flex-col gap-8">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="books-table"
          action="/dashboard/admin/books"
          placeholder="Filter books..."
        />

        <Link href="/dashboard/admin/books/new">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <Table id="books-table">
        <Table.Head>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Publisher</th>
            <th>Release Date</th>
            <th>Approval</th>
            <th>Publish</th>
            <th>Actions</th>
          </tr>
        </Table.Head>
        <Table.Body id={targetId} {...tableBodyAttrs}>
          {books.map((book) => (
            <BooksTableRow key={book.id} book={book} />
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
  book: BookWithAdminRelations;
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
      <td>
        <PublishToggleForm book={book} />
      </td>
      <td>
        <ScheduleWeekButton book={book} />
      </td>
      <td>
        <PreviewButton book={book} user={user} />
      </td>
      <td>
        <a href={`/dashboard/admin/books/edit/${book.id}`}>
          <button class="cursor-pointer">{editIcon}</button>
        </a>
      </td>
      <td>
        <DeleteFormButton action={`/dashboard/admin/books/delete/${book.id}`} />
      </td>
    </tr>
  );
};

const ScheduleWeekButton = ({ book }: { book: BookWithAdminRelations }) => {
  if (book.bookOfTheWeekEntry) {
    return (
      <a
        href={`/dashboard/admin/book-of-the-week/edit/${book.id}`}
        x-target="modal-root"
      >
        {toWeekString(book.bookOfTheWeekEntry.weekStart)}
      </a>
    );
  }
  return (
    <a
      href={`/dashboard/admin/book-of-the-week/${book.id}`}
      x-target="modal-root"
    >
      {calendarIcon}
    </a>
  );
};
