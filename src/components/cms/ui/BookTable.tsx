import { AuthUser } from "../../../../types";
import { Creator } from "../../../db/schema";
import {
  getBooksByArtistId,
  getBooksByPublisherId,
} from "../../../services/books";
import PreviewButton from "../../api/PreviewButton";
import Button from "../../app/Button";
import Link from "../../app/Link";
import SectionTitle from "../../app/SectionTitle";
import PublishToggleForm from "../forms/PublishToggleForm";
import BookTableRow from "./BookTableRow";
import Table from "./Table";
import TableSearch from "./TableSearch";

type BookTableProps = {
  searchQuery?: string;
  creator: Creator;
  user: AuthUser | null;
};

export const BookTable = async ({
  searchQuery,
  creator,
  user,
}: BookTableProps) => {
  const getBooksFn = {
    artist: getBooksByArtistId,
    publisher: getBooksByPublisherId,
  };

  const books = await getBooksFn[creator.type](creator.id, searchQuery);

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
      {/* Desktop View */}
      <div class="hidden md:block">
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
              validBooks?.map((book) => (
                <BookTableRow book={book} user={user} />
              ))
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
      {/* Mobile View */}
      <div class="block md:hidden">
        {validBooks && validBooks.length > 0 ? (
          <ul
            class="flex flex-col gap-4"
            id="books-table-body"
            x-init
            {...{ "@book:approved.window": "$ajax('/dashboard/books')" }}
          >
            {validBooks.map((book) => (
              <BookTableRowMobile key={book.id} book={book} user={user} />
            ))}
          </ul>
        ) : (
          <div class="rounded-radius border border-outline bg-surface-alt p-6 text-center">
            <p class="text-sm text-on-surface-alt">
              No books found. Please add one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

type BookTableRowMobileProps = {
  book: import("../../../db/schema").Book & {
    artist: import("../../../db/schema").Creator;
    publisher: import("../../../db/schema").Creator;
  };
  user: AuthUser | null;
};

const BookTableRowMobile = ({ book, user }: BookTableRowMobileProps) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return null;
  }

  const releaseDateFormatted = book.releaseDate
    ? book.releaseDate.toISOString().slice(0, 10).split("-").reverse().join("/")
    : "";

  return (
    <li class="rounded-radius border border-outline bg-surface-alt overflow-hidden">
      <div class="p-4 flex flex-col gap-3">
        <div class="flex gap-3">
          <div class="shrink-0">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                class="h-14 w-11 object-cover rounded-sm"
              />
            ) : (
              <a href={`/dashboard/books/edit/${book.id}#book-images`}>
                <Button
                  variant="outline"
                  color="warning"
                  class="!py-2 !px-3 text-xs"
                >
                  <span>Upload Cover</span>
                </Button>
              </a>
            )}
          </div>
          <div class="min-w-0 flex-1 flex flex-col gap-0.5">
            <p class="font-medium text-on-surface truncate">{book.title}</p>
            {book.artist && (
              <a
                href={`/creators/${book.artist.slug}`}
                class="text-sm text-on-surface-weak truncate hover:underline"
              >
                {book.artist.displayName}
              </a>
            )}
            {releaseDateFormatted ? (
              <p class="text-xs text-on-surface-weak">{releaseDateFormatted}</p>
            ) : null}
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 border-t border-outline pt-3">
          <PublishToggleForm book={book} />
          <PreviewButton book={book} user={user} />
          <a href={`/dashboard/books/edit/${book.id}`}>
            <Button
              variant="outline"
              color="inverse"
              class="!py-2 !px-3 text-xs"
            >
              <span>Edit</span>
            </Button>
          </a>
          {/* <DeleteBookForm book={book} user={user} /> */}
        </div>
      </div>
    </li>
  );
};
