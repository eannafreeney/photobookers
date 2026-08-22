import Pill from "../../../components/app/Pill";
import { DISCOVER_TAGS } from "../../../constants/discover";
import {
  BOOK_CATALOG_SORT_LABELS,
  BOOK_CATALOG_SORT_VALUES,
  type BookCatalogSort,
} from "../../../lib/bookCatalogSort";
import { tagToSlug } from "../../../lib/tags";
import { capitalize } from "../../../utils";
import CollapsibleFilters from "./CollapsibleFilters";

export const BOOKS_LIST_TARGET_ID = "books-list";
export const BOOKS_CATALOG_TARGET_ID = "books-catalog";

type Props = {
  activeTag?: string | null;
  query?: string | null;
  sort?: BookCatalogSort;
  defaultSort?: BookCatalogSort;
  ajaxPath?: string;
  historyPath?: string | null;
  collapsible?: boolean;
};

const BookFilters = ({
  activeTag = null,
  query = null,
  sort = "newest",
  defaultSort = "newest",
  ajaxPath = "/books",
  historyPath = "/books",
  collapsible = false,
}: Props) => {
  const trimmedQuery = query?.trim() ?? "";
  const activeSlug = activeTag?.trim() || null;
  const activeFilterCount =
    (trimmedQuery.length >= 3 ? 1 : 0) + (sort !== defaultSort ? 1 : 0);

  const alpineAttrs = {
    "x-data": `bookFilters(${JSON.stringify({
      query: trimmedQuery,
      tag: activeSlug,
      sort,
      defaultSort,
      ajaxPath,
      historyPath,
    })})`,
    "x-on:ajax:send": "searchLoading = true",
    "x-on:ajax:after": "searchLoading = false",
    "x-on:ajax:sent": "if (!$event.detail.html) searchLoading = false",
  };

  const pillButtonClass =
    "cursor-pointer border-0 bg-transparent p-0 font-inherit";

  const controls = (
    <>
      <div class="flex flex-col md:flex-row items-center justify-between gap-16 md:gap-4">
        <TrendingSortSelect />
        <FilterForm />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <AllPill activeSlug={activeSlug} pillButtonClass={pillButtonClass} />
        {DISCOVER_TAGS.map((tag) => (
          <DiscoveryPill
            tag={tag}
            activeSlug={activeSlug}
            pillButtonClass={pillButtonClass}
          />
        ))}
      </div>
    </>
  );

  return (
    <div {...alpineAttrs} class="mb-6">
      {collapsible ? (
        <CollapsibleFilters
          activeFilterCount={activeFilterCount}
          controlsId="book-search-filters"
          desktopGridClass="md:grid-cols-1"
        >
          {controls}
        </CollapsibleFilters>
      ) : (
        <div class="flex flex-col gap-4 rounded-lg border border-outline bg-surface p-4">
          {controls}
        </div>
      )}
    </div>
  );
};

export default BookFilters;

type AllPillProps = {
  activeSlug: string | null;
  pillButtonClass: string;
};

const AllPill = ({ activeSlug, pillButtonClass }: AllPillProps) => (
  <button type="button" class={pillButtonClass} x-on:click="applyFilter(null)">
    <Pill variant={activeSlug ? "default" : "inverse"}>All</Pill>
  </button>
);

type DiscoveryPillProps = {
  tag: string;
  activeSlug: string | null;
  pillButtonClass: string;
};

const DiscoveryPill = ({
  tag,
  activeSlug,
  pillButtonClass,
}: DiscoveryPillProps) => {
  const slug = tagToSlug(tag);
  const isActive = activeSlug === slug;
  return (
    <button
      key={tag}
      type="button"
      class={pillButtonClass}
      x-on:click={`applyFilter('${slug}')`}
    >
      <Pill variant={isActive ? "inverse" : "default"}>{capitalize(tag)}</Pill>
    </button>
  );
};

const FilterForm = () => {
  const searchInputAttrs = {
    "x-on:input.debounce.400ms": "runSearch()",
  };

  return (
    <div class="flex items-center gap-2 w-3/4">
      <div
        class="book-search-field relative min-w-0 flex-1"
        x-bind:aria-busy="searchLoading"
      >
        <input
          type="search"
          name="query"
          x-model="query"
          {...searchInputAttrs}
          placeholder="Search by title, artist, publisher, or tag…"
          class="w-full rounded-full border border-outline bg-surface-alt px-4 py-2 pr-10 text-base md:text-sm text-on-surface-strong placeholder:text-on-surface-weak focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="button"
        x-on:click="clearFilters()"
        class="cursor-pointer rounded-full border border-outline px-4 py-2 text-sm font-medium text-on-surface hover:text-on-surface-strong"
      >
        Clear
      </button>
    </div>
  );
};

const TrendingSortSelect = () => (
  <label class="flex w-1/4 md:w-auto min-w-0 items-center gap-2 text-sm text-on-surface">
    <span class="sr-only">Sort by</span>
    <select
      x-model="sort"
      x-on:change="applySort()"
      class="border border-outline px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent"
    >
      {BOOK_CATALOG_SORT_VALUES.map((value) => (
        <option key={value} value={value}>
          {BOOK_CATALOG_SORT_LABELS[value]}
        </option>
      ))}
    </select>
  </label>
);
