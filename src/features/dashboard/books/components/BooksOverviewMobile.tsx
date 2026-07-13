import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import PreviewButton from "../../../api/components/PreviewButton";
import Button from "../../../../components/app/Button";
import PublishToggleForm from "./PublishToggleForm";
import DeleteBookForm from "./BookDeleteForm";
import TableSearch from "../../../../components/app/TableSearch";
import Link from "../../../../components/app/Link";
import BookApprovalStatusPill from "../../admin/books/components/BookApprovalStatusPill";
import { canEditBook } from "../../../../lib/permissions";
import { InfiniteScroll } from "../../../../components/app/InfiniteScroll";

type BooksOverviewMobileProps = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  user: AuthUser;
  currentPath: string;
  page: number;
  totalPages: number;
};

const BooksOverviewMobile = ({
  books,
  user,
  currentPath,
  page,
  totalPages,
}: BooksOverviewMobileProps) => {
  const targetId = "books-table-body";

  const listAttrs = {
    "x-init": "true",
    "@books:updated.window":
      "$ajax('/dashboard', { target: 'books-table-body' })",
  };

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3">
        <TableSearch
          isMobile
          target="books-table"
          action="/dashboard"
          placeholder="Filter books..."
        />
        <div class="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/books/import">
            <Button variant="outline" color="inverse">
              Import CSV
            </Button>
          </Link>
          <Link href="/dashboard/books/new">
            <Button variant="solid" color="primary">
              New Book
            </Button>
          </Link>
        </div>
      </div>

      <ul id={targetId} class="flex flex-col gap-4" {...listAttrs}>
        {books.map((book) => (
          <BookCardMobile book={book} user={user} />
        ))}
      </ul>

      {totalPages > 1 ? (
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      ) : null}
    </div>
  );
};

export default BooksOverviewMobile;

type RowProps = {
  book: Book & { artist: Creator | null; publisher: Creator | null };
  user: AuthUser;
};

const BookCardMobile = ({ book, user }: RowProps) => {
  if (!book?.id || !book.slug || !book.title) {
    return null;
  }

  return (
    <li class="rounded-radius border border-outline bg-surface overflow-hidden">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex gap-3">
          <div class="shrink-0">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                class="h-20 w-14 object-cover rounded-sm"
              />
            ) : (
              <a href={`/dashboard/books/${book.id}#book-images`}>
                <Button variant="outline" color="warning">
                  <span>Upload Cover</span>
                </Button>
              </a>
            )}
          </div>
          <div class="min-w-0 flex-1">
            <Link
              href={
                book.publicationStatus === "published"
                  ? `/books/${book.slug}`
                  : `/books/preview/${book.slug}`
              }
            >
              <p class="font-medium text-on-surface-strong line-clamp-3">
                {book.title}
              </p>
            </Link>
          </div>
        </div>

        <dl class="grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm">
          <dt class="text-on-surface-weak">Approval</dt>
          <dd>
            <BookApprovalStatusPill
              approvalStatus={book.approvalStatus ?? "pending"}
            />
          </dd>
          <dt class="text-on-surface-weak">Publish</dt>
          <dd>
            <PublishToggleForm book={book} user={user} />
          </dd>
        </dl>

        <div class="flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3">
          <PreviewButton book={book} user={user} />
          <a href={`/dashboard/books/${book.id}`}>
            <Button
              variant="outline"
              color="inverse"
              disabled={!canEditBook(user, book)}
            >
              <span>Edit</span>
            </Button>
          </a>
          <DeleteBookForm book={book} user={user} />
        </div>
      </div>
    </li>
  );
};
