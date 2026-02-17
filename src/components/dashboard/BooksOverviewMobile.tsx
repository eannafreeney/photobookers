import { AuthUser } from "../../../types";
import { Book, Creator } from "../../db/schema";
import PreviewButton from "../api/PreviewButton";
import Button from "../app/Button";
import SectionTitle from "../app/SectionTitle";
import PublishToggleForm from "../cms/forms/PublishToggleForm";
import DeleteBookForm from "./BookDeleteForm";
import TableSearch from "../cms/ui/TableSearch";
import Link from "../app/Link";

type BooksOverviewMobileProps = {
  books: Book[];
  user: AuthUser | null;
};

const BooksOverviewMobile = ({ books, user }: BooksOverviewMobileProps) => {
  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>My Books</SectionTitle>
      <div class="flex flex-col gap-4">
        <Link href="/dashboard/books/new">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
        <TableSearch
          isMobile
          target="books-table"
          action="/dashboard/books"
          placeholder="Filter books..."
        />
      </div>

      {books?.length > 0 && (
        <ul
          class="flex flex-col gap-4"
          id="books-table"
          x-init
          {...{ "@book:approved.window": "$ajax('/dashboard/books')" }}
        >
          {books.map((book) => (
            <BookTableRowMobile key={book.id} book={book} user={user} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default BooksOverviewMobile;

type RowProps = {
  book: Book & {
    artist: Creator;
    publisher: Creator;
  };
  user: AuthUser | null;
};

const BookTableRowMobile = ({ book, user }: RowProps) => {
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
                <Button variant="outline" color="warning">
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
        <div class="flex items-center gap-2 border-t border-outline pt-3">
          <PublishToggleForm book={book} user={user} />
          <PreviewButton book={book} user={user} />
          <a href={`/dashboard/books/edit/${book.id}`}>
            <Button variant="outline" color="inverse" width="sm">
              Edit
            </Button>
          </a>
          <DeleteBookForm book={book} user={user} />
        </div>
      </div>
    </li>
  );
};
