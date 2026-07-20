import Modal from "@/components/app/Modal";
import FormPost from "@/components/forms/FormPost";
import Button from "@/components/app/Button";
import type { BookCardResult } from "@/constants/queries";

type Props = {
  /** Base issue action, e.g. `/dashboard/admin/magazine/${id}`. */
  action: string;
  /** The current search text (echoed back so the input keeps its value). */
  query: string;
  /** Matching books to offer, already excluding ones in the issue. */
  results: BookCardResult[];
};

// The results block — swapped in place (id `add-book-results`) on each search,
// leaving the search input above it focused.
export const AddBookResults = ({ action, query, results }: Props) => {
  const trimmed = query.trim();
  return (
    <div id="add-book-results" class="mt-3">
      {trimmed === "" ? (
        <p class="text-sm text-on-surface-weak">
          Search for a book by title or artist to add it to this issue.
        </p>
      ) : results.length === 0 ? (
        <p class="text-sm text-on-surface-weak">
          No matching books found for “{trimmed}”.
        </p>
      ) : (
        <ul class="flex max-h-[min(50vh,calc(100dvh-18rem))] flex-col divide-y divide-outline/60 overflow-y-auto overscroll-contain rounded border border-outline/60">
          {results.map((book) => (
            <li key={book.id} class="flex items-center gap-3 bg-surface p-2">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt=""
                  loading="lazy"
                  class="h-16 w-12 shrink-0 border border-outline object-cover"
                />
              ) : (
                <div class="flex h-16 w-12 shrink-0 items-center justify-center border border-outline text-[0.55rem] text-on-surface-weak">
                  no image
                </div>
              )}
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-on-surface-strong">
                  {book.title}
                </p>
                <p class="truncate text-xs text-on-surface-weak">
                  {book.artist?.displayName ?? "Unknown artist"}
                </p>
              </div>
              <FormPost
                action={`${action}/add-book`}
                className="shrink-0"
                {...{
                  "x-target": "magazine-books toast",
                  "x-on:ajax:after": "$dispatch('dialog:close')",
                }}
              >
                <input type="hidden" name="bookId" value={book.id} />
                <Button variant="outline" color="primary">
                  Add
                </Button>
              </FormPost>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// The full "add a book" modal: a live-search input over the results block.
const AddBookModal = ({ action, query, results }: Props) => {
  return (
    <Modal title="Add a book" maxWidth="max-w-2xl">
      <form
        x-target="add-book-results"
        method="get"
        action={`${action}/add-book`}
        role="search"
      >
        <input
          type="search"
          name="q"
          value={query}
          placeholder="Search by book title or artist…"
          autofocus
          autocomplete="off"
          {...{ "x-on:input.debounce.350ms": "$el.form.requestSubmit()" }}
          class="w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
        />
      </form>
      <AddBookResults action={action} query={query} results={results} />
    </Modal>
  );
};

export default AddBookModal;
