import { AuthUser } from "../../../../types";
import {
  getBooksByArtistId,
  getBooksByPublisherId,
} from "../../../services/books";
import { getInputIcon } from "../../../utils";
import Button from "../../app/Button";
import Link from "../../app/Link";
import SectionTitle from "../../app/SectionTitle";
import BookTableRow from "./BookTableRow";
import Table from "./Table";
import TableSearch from "./TableSearch";

type BookTableProps = {
  searchQuery?: string;
  creatorId: string;
  creatorType: "artist" | "publisher";
  user: AuthUser | null;
};

export const BookTable = async ({
  searchQuery,
  creatorId,
  creatorType,
  user,
}: BookTableProps) => {
  const getBooksFn = {
    artist: getBooksByArtistId,
    publisher: getBooksByPublisherId,
  };

  const books = await getBooksFn[creatorType](creatorId, searchQuery);

  const validBooks = books?.filter((book) => book != null);

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
        <Table.Body
          id="books-table-body"
          x-init
          {...{ "@book:approved.window": "$ajax('/dashboard/books')" }}
        >
          {validBooks && validBooks.length > 0 ? (
            validBooks?.map((book) => <BookTableRow book={book} user={user} />)
          ) : (
            <tr>
              <td colspan={100} class="text-center p-4">
                <p class="text-sm text-on-surface-alt">
                  No books found. Please add one.{" "}
                </p>
              </td>
            </tr>
          )}
        </Table.Body>
      </Table>
    </div>
  );
};
