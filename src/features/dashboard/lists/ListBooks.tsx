import { BookCardResult } from "../../../constants/queries";
import Link from "../../../components/app/Link";
import { deleteIcon, dragHandleIcon } from "../../../lib/icons";

export type ListBook = BookCardResult & { note?: string | null };

const reorderHandleAttrs = {
  draggable: true,
  "@dragstart": "onReorderDragStart($event, $el.closest('[data-book-id]'))",
  "@dragend": "onReorderDragEnd()",
};

const reorderRowAttrs = {
  "@dragenter.prevent": "onReorderDragEnter($el)",
  "@dragover.prevent": true,
  "@drop.prevent": true,
};

type Props = {
  listId: string;
  books: ListBook[];
};

const ListBooks = ({ listId, books }: Props) => {
  if (books.length === 0) {
    return (
      <div id="list-books-editor">
        <p class="text-sm text-on-surface-weak">
          No books in this list yet. Search above to add some.
        </p>
      </div>
    );
  }

  const reorderUrl = `/dashboard/lists/${listId}/reorder`;

  return (
    <div
      id="list-books-editor"
      {...{
        "x-data": `booksTableReorder(${JSON.stringify(books.map((book) => book.id))}, null, ${JSON.stringify(reorderUrl)})`,
      }}
    >
      <ul class="flex flex-col gap-2">
        {books.map((book) => (
          <li
            class="flex items-center gap-3 border border-outline bg-surface-alt p-2"
            {...{ "data-book-id": book.id }}
            {...reorderRowAttrs}
          >
            <div
              class="flex shrink-0 items-center justify-center text-on-surface/50 cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
              {...reorderHandleAttrs}
            >
              {dragHandleIcon()}
            </div>
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt=""
                class="size-12 object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div class="size-12 bg-surface shrink-0" />
            )}
            <div class="min-w-0 flex-1">
              <Link href={`/books/${book.slug}`}>
                <span class="text-sm font-medium text-on-surface-strong">
                  {book.title}
                </span>
              </Link>
              {book.artist?.displayName ? (
                <p class="text-xs text-on-surface-weak">
                  {book.artist.displayName}
                </p>
              ) : null}
              {book.publisher?.displayName ? (
                <p class="text-xs text-on-surface-weak">
                  {book.publisher.displayName}
                </p>
              ) : null}
            </div>
            <a
              href={`/dashboard/lists/${listId}/books/${book.id}/note`}
              x-target="modal-root"
              class="shrink-0 rounded border border-outline bg-surface-alt px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface cursor-pointer"
              title={book.note ? "Edit note" : "Add note"}
              aria-label={
                book.note
                  ? `Edit note for ${book.title}`
                  : `Add note for ${book.title}`
              }
            >
              {book.note ? "Edit Note" : "Add Note"}
            </a>
            <form
              method="post"
              action={`/dashboard/lists/${listId}/books/${book.id}`}
              x-data="{ isSubmitting: false }"
              {...{
                "@ajax:before": "isSubmitting = true",
                "@ajax:after": "isSubmitting = false",
                "@ajax:error": "isSubmitting = false",
                "x-target": "toast list-books-editor",
                "x-target.error": "toast",
              }}
            >
              <input type="hidden" name="_method" value="DELETE" />
              <button
                type="submit"
                class="cursor-pointer text-on-surface hover:text-error disabled:opacity-50"
                title="Remove from list"
                aria-label={`Remove ${book.title}`}
                x-bind:disabled="isSubmitting"
              >
                {deleteIcon}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListBooks;
