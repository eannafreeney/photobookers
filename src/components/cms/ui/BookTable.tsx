
import { AuthUser } from "../../../../types";
import {
  getBooksByArtistId,
  getBooksByPublisherId,
} from "../../../services/books";
import { getInputIcon } from "../../../utils";
import Button from "../../app/Button";
import Card from "../../app/Card";
import Link from "../../app/Link";
import SectionTitle from "../../app/SectionTitle";
import BookTableRow from "./BookTableRow";
import Search from "./Search";

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
    <div class="flex flex-col gap-4" >
      <SectionTitle>My Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <BookTableSearch />
        <Link href="/dashboard/books/new">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <div class="overflow-hidden w-full overflow-x-auto rounded-radius border border-outline">
        <table class="w-full text-left text-sm text-on-surface">
          <thead class="border-b border-outline bg-surface-alt text-sm text-on-surface-strong">
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
          </thead>
          <tbody
            id="books-table"
            {...{ "@book:approved.window": "$ajax('/dashboard/books')" }}
            class="divide-y divide-outline"
            x-init
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookTableSearch = () => {
  const alpineAttrs = {
    "x-on:input.debounce": "$el.form.requestSubmit()",
    "x-on:search": "$el.form.requestSubmit()",
  };

  return (
    <form x-target="books-table" action="/dashboard/books" autocomplete="off">
      <label class="bg-surface-alt w-64 rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
        {getInputIcon("search")}
        <input
          type="search"
          class="w-full bg-surface-alt px-2 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
          name="search"
          placeholder="Filter books..."
          {...alpineAttrs}
        />
      </label>
    </form>
  );
};
