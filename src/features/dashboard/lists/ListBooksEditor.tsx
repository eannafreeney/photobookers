import { BookCardResult } from "../../../constants/queries";
import Link from "../../../components/app/Link";

type Props = {
  listId: string;
  books: BookCardResult[];
};

const ListBooksEditor = ({ listId, books }: Props) => {
  if (books.length === 0) {
    return (
      <p class="text-sm text-on-surface-weak">
        No books in this list yet. Use the + button on any book card to add
        one.
      </p>
    );
  }

  return (
    <ul id="list-books-editor" class="flex flex-col gap-2">
      {books.map((book) => (
        <li class="flex items-center gap-3 border border-outline bg-surface-alt p-2">
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
          </div>
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
              class="text-sm text-error hover:underline disabled:opacity-50"
              x-bind:disabled="isSubmitting"
            >
              Remove
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
};

export default ListBooksEditor;
