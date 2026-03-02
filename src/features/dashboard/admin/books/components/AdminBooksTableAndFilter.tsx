import { AuthUser } from "../../../../../../types";
import Link from "../../../../../components/app/Link";
import { Pagination } from "../../../../../components/app/Pagination";
import Table from "../../../../../components/app/Table";
import { useUser } from "../../../../../contexts/UserContext";
import { calendarIcon, editIcon } from "../../../../../lib/icons";
import { toWeekString } from "../../../../../lib/utils";
import { formatDate } from "../../../../../utils";
import PreviewButton from "../../../../api/components/PreviewButton";
import PublishToggleForm from "../../../books/components/PublishToggleForm";
import DeleteFormButton from "../../components/DeleteFormButton";
import BookStatusForm from "../forms/BookStatusForm";
import { BookWithAdminRelations } from "../types";

type Props = {
  books: BookWithAdminRelations[];
  status?: "approved" | "pending" | "rejected" | undefined;
  totalPages: number;
  page: number;
  currentPath: string;
  user: AuthUser | null;
};

const AdminBooksTableAndFilter = async ({
  books,
  status = undefined,
  totalPages,
  page,
  currentPath,
  user,
}: Props) => {
  const targetId = "books-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@books:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/books', { target: 'books-table-container' })`,
  };

  return (
    <div id="books-table-container" class="flex flex-col gap-4">
      <BookStatusForm status={status} />
      <Table id="books-table">
        <Table.Head>
          <tr>
            <Table.HeadRow>Title</Table.HeadRow>
            <Table.HeadRow>Artist</Table.HeadRow>
            <Table.HeadRow>Publisher</Table.HeadRow>
            <Table.HeadRow>Release Date</Table.HeadRow>
            <Table.HeadRow>Approval</Table.HeadRow>
            <Table.HeadRow>Publish</Table.HeadRow>
            <Table.HeadRow>Actions</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body id={targetId} {...tableBodyAttrs}>
          {books.map((book) => (
            <BooksTableRow key={book.id} book={book} user={user} />
            // <span>Book {book.id}</span>
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

export default AdminBooksTableAndFilter;

type BooksTableRowProps = {
  book: BookWithAdminRelations;
  user: AuthUser | null;
};

const BooksTableRow = ({ book, user }: BooksTableRowProps) => {
  if (!user) return <></>;

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
