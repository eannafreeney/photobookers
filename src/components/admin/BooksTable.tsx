import { Book, Creator } from "../../db/schema";
import { getAllBooksAdmin } from "../../services/admin";
import { capitalize, formatDate } from "../../utils";
import Button from "../app/Button";
import Link from "../app/Link";
import SectionTitle from "../app/SectionTitle";
import Table from "../cms/ui/Table";
import TableSearch from "../cms/ui/TableSearch";

type Props = {
  searchQuery?: string;
};

const BooksTable = async ({ searchQuery }: Props) => {
  const books = await getAllBooksAdmin(searchQuery);

  console.log("books", books[0]);

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
      <Table id="books-table">
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
        <Table.Body id="books-table-body">
          {books.map((book) => (
            <BooksTableRow book={book} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default BooksTable;

type BooksTableRowProps = {
  book: Book & { artist: Creator; publisher: Creator };
};

const BooksTableRow = ({ book }: BooksTableRowProps) => {
  return (
    <tr>
      <td>
        <Link href={`/books/${book.slug}`} target="_blank">
          {book.title}
        </Link>
      </td>
      <td>
        <Link href={`/creators/${book.artist?.slug}`}>
          {book.artist?.displayName}
        </Link>
      </td>
      <td>
        <Link href={`/creators/${book.publisher?.slug}`}>
          {book.publisher?.displayName}
        </Link>
      </td>
      <td>{book.releaseDate ? formatDate(book.releaseDate) : ""}</td>
      <td>{capitalize(book.approvalStatus ?? "")}</td>
      <td>{formatDate(book.createdAt ?? new Date())}</td>
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
