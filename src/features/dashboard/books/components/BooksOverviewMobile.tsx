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

type MobileBook = Book & {
  artist: Pick<Creator, "id" | "displayName" | "slug"> | null;
  publisher: Pick<Creator, "id" | "displayName" | "slug"> | null;
};

type BooksOverviewMobileProps = {
  books: MobileBook[];
  user: AuthUser;
  currentPath: string;
  page: number;
  totalPages: number;
  /** List route used for search + live refresh (e.g. "/dashboard/admin/books"). */
  basePath?: string;
  /** Base for a book's edit/cover/delete routes (e.g. "/dashboard/admin/books"). */
  editBasePath?: string;
};

const BooksOverviewMobile = ({
  books,
  user,
  currentPath,
  page,
  totalPages,
  basePath = "/dashboard",
  editBasePath = "/dashboard/books",
}: BooksOverviewMobileProps) => {
  const targetId = "books-table-body";

  const listAttrs = {
    "x-init": "true",
    "@books:updated.window": `$ajax('${basePath}', { target: '${targetId}' })`,
  };

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3">
        <TableSearch
          isMobile
          target="books-table"
          action={basePath}
          placeholder="Filter books..."
        />
      </div>

      <ul id={targetId} class="flex flex-col gap-4" {...listAttrs}>
        {books.map((book) => (
          <BookCardMobile book={book} user={user} editBasePath={editBasePath} />
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
  book: MobileBook;
  user: AuthUser;
  editBasePath: string;
};

const BookCardMobile = ({ book, user, editBasePath }: RowProps) => {
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
              <a href={`${editBasePath}/${book.id}#book-images`}>
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
            {book.artist ? (
              <Link
                href={`/creators/${book.artist.slug}`}
                className="block text-sm text-on-surface-weak line-clamp-1"
                hoverUnderline
              >
                {book.artist.displayName}
              </Link>
            ) : null}
            {book.publisher ? (
              <Link
                href={`/creators/${book.publisher.slug}`}
                className="block text-sm text-on-surface-weak line-clamp-1"
                hoverUnderline
              >
                {book.publisher.displayName}
              </Link>
            ) : null}
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
          <a href={`${editBasePath}/${book.id}`}>
            <Button
              variant="outline"
              color="inverse"
              disabled={!canEditBook(user, book)}
            >
              <span>Edit</span>
            </Button>
          </a>
          <DeleteBookForm book={book} user={user} basePath={editBasePath} />
        </div>
      </div>
    </li>
  );
};
