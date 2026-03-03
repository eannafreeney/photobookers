import { AuthUser } from "../../../../../../types";
import Link from "../../../../../components/app/Link";
import { Pagination } from "../../../../../components/app/Pagination";
import Table from "../../../../../components/app/Table";
import { calendarIcon, editIcon } from "../../../../../lib/icons";
import { toWeekString } from "../../../../../lib/utils";
import { formatDate } from "../../../../../utils";
import PreviewButton from "../../../../api/components/PreviewButton";
import PublishToggleForm from "../../../books/components/PublishToggleForm";
import DeleteFormButton from "../../components/DeleteFormButton";
import BookStatusForm from "../forms/BookStatusForm";
import { getAllBooksAdmin } from "../services";
import { BookWithAdminRelations } from "../types";

type Props = {
  status?: "approved" | "pending" | "rejected" | undefined;
  currentPage: number;
  searchQuery?: string;
  currentPath: string;
  user: AuthUser | null;
};

const AdminBooksTableAndFilter = async ({
  status = undefined,
  currentPage,
  searchQuery,
  currentPath,
  user,
}: Props) => {
  const result = await getAllBooksAdmin(currentPage, searchQuery, status);

  if (!result?.books) {
    return <div>No featured books found</div>;
  }

  const { books, totalPages, page } = result;

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
      <Table.BodyRow>
        <Link href={`/books/${book.slug}`} target="_blank">
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
          {book.publisher?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        {book.releaseDate ? formatDate(book.releaseDate) : ""}
      </Table.BodyRow>
      <Table.BodyRow>
        {book.approvalStatus === "approved" ? (
          <p class=" text-success">✓ Approved</p>
        ) : book.approvalStatus === "pending" ? (
          <p class=" text-warning">⋯ Pending</p>
        ) : book.approvalStatus === "rejected" ? (
          <p class=" text-danger">✗ Rejected</p>
        ) : null}
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishToggleForm book={book} />
      </Table.BodyRow>
      <Table.BodyRow>
        <ScheduleWeekButton book={book} />
      </Table.BodyRow>
      <Table.BodyRow>
        <PreviewButton book={book} user={user} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a href={`/dashboard/admin/books/${book.id}`}>
          <button class="cursor-pointer">{editIcon}</button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteFormButton action={`/dashboard/admin/books/delete/${book.id}`} />
      </Table.BodyRow>
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
