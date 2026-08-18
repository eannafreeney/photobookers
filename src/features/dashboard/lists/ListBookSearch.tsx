import type { BookCardResult } from "../../../constants/queries";
import FormPost from "../../../components/forms/FormPost";
import { closeIcon, plusIcon } from "../../../lib/icons";

type ResultsProps = {
  listId: string;
  query: string;
  results: BookCardResult[];
};

export const ListBookSearchResults = ({
  listId,
  query,
  results,
}: ResultsProps) => {
  const trimmed = query.trim();

  return (
    <div id="list-book-search-results">
      {trimmed.length < 2 ? null : results.length === 0 ? (
        <p class="p-3 text-sm text-on-surface-weak">
          No matching books found for “{trimmed}”.
        </p>
      ) : (
        <ul class="flex max-h-80 flex-col divide-y divide-outline overflow-y-auto">
          {results.map((book) => (
            <li class="flex items-center gap-3 bg-surface p-2">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt=""
                  loading="lazy"
                  class="size-12 shrink-0 object-cover"
                />
              ) : (
                <div class="size-12 shrink-0 bg-surface-alt" />
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
                action={`/dashboard/lists/${listId}/add-book`}
                className="shrink-0"
                {...{
                  "x-target":
                    "toast list-books-editor list-book-search-results",
                  "x-target.error": "toast",
                }}
              >
                <input type="hidden" name="bookId" value={book.id} />
                <input type="hidden" name="q" value={trimmed} />
                <button
                  type="submit"
                  class="cursor-pointer text-on-surface-strong hover:opacity-75"
                  title="Add to list"
                  aria-label={`Add ${book.title}`}
                >
                  {plusIcon(5)}
                </button>
              </FormPost>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

type Props = {
  listId: string;
};

const ListBookSearch = ({ listId }: Props) => {
  const alpineAttrs = {
    "x-data": "{ hasResults: false, searchValue: '' }",
    "@click.outside": "hasResults = false",
    "@keydown.escape.window":
      "hasResults = false; searchValue = ''; $refs.searchInput?.blur()",
  };

  return (
    <div class="relative" {...alpineAttrs}>
      <form
        method="get"
        action={`/dashboard/lists/${listId}/add-book`}
        role="search"
        autocomplete="off"
        class="relative"
        {...{
          "x-target": "list-book-search-results",
          "x-on:ajax:success": "hasResults = searchValue.trim().length >= 2",
        }}
      >
        <input
          type="text"
          name="q"
          x-ref="searchInput"
          placeholder="Search by title or artist…"
          autocomplete="off"
          class="w-full rounded-radius border border-outline bg-surface py-2.5 pl-3 pr-10 text-sm text-on-surface-strong focus:outline-none"
          {...{
            "x-model": "searchValue",
            "@input.debounce.350ms": "$el.form.requestSubmit()",
            "@focus":
              "if (searchValue.trim().length >= 2) $el.form.requestSubmit()",
          }}
        />
        <button
          type="button"
          x-cloak
          x-show="hasResults || searchValue"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 hover:opacity-100"
          title="Close search"
          aria-label="Close search"
          {...{
            "x-on:click":
              "hasResults = false; searchValue = ''; $refs.searchInput?.blur()",
          }}
        >
          {closeIcon}
        </button>
      </form>
      <p class="mt-2 text-sm text-on-surface-weak" x-show="!hasResults">
        Search by title or artist to add books. You can add more than one.
      </p>
      <div
        class="absolute z-20 mt-1 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt shadow-sm"
        x-cloak
        x-show="hasResults"
      >
        <div id="list-book-search-results"></div>
      </div>
    </div>
  );
};

export default ListBookSearch;
