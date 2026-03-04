import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import PreviewButton from "../../../api/components/PreviewButton";
import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import PublishToggleForm from "./PublishToggleForm";
import DeleteBookForm from "./BookDeleteForm";
import TableSearch from "../../../../components/app/TableSearch";
import Link from "../../../../components/app/Link";

type BooksOverviewMobileProps = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser | null;
};

const BooksOverviewMobile = ({ books, user }: BooksOverviewMobileProps) => {
  const alpineAttrs = {
    "x-init": "true",
    "@books:updated.window":
      "$ajax('/dashboard/books', target: 'books-table-body')",
  };

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
        <ul class="flex flex-col gap-4" id="books-table" {...alpineAttrs}>
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
  book: Book & { artist: Creator | null; publisher: Creator | null };
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
              <a href={`/dashboard/books/${book.id}/update#book-images`}>
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
          <PublishToggleForm book={book} />
          <PreviewButton book={book} user={user} />
          <a href={`/dashboard/books/${book.id}/update`}>
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
