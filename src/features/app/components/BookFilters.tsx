import Pill from "../../../components/app/Pill";
import { DISCOVER_TAGS } from "../../../constants/discover";
import { booksFilterUrl, tagToSlug } from "../../../lib/tags";
import { capitalize } from "../../../utils";

export const BOOKS_LIST_TARGET_ID = "books-list";
export const BOOKS_CATALOG_TARGET_ID = "books-catalog";

type Props = {
  activeTag?: string | null;
  q?: string | null;
  ajaxPath?: string;
  historyPath?: string | null;
};

const BookFilters = ({
  activeTag = null,
  q = null,
  ajaxPath = "/books",
  historyPath = "/books",
}: Props) => {
  const trimmedQ = q?.trim() ?? "";
  const activeSlug = activeTag?.trim() || null;

  const alpineAttrs = {
    "x-data": `bookFilters(${JSON.stringify({
      q: trimmedQ,
      tag: activeSlug,
      ajaxPath,
      historyPath,
    })})`,
  };

  const pillButtonClass =
    "cursor-pointer border-0 bg-transparent p-0 font-inherit";

  return (
    <div
      {...alpineAttrs}
      class="mb-6 flex flex-col gap-4 rounded-lg border border-outline bg-surface p-4"
    >
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
      <FilterForm />
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
    <div class="flex flex-wrap items-center gap-2">
      <input
        type="search"
        name="q"
        x-model="q"
        {...searchInputAttrs}
        placeholder="Search by title, artist, publisher, or tag…"
        class="min-w-0 flex-1 rounded-full border border-outline bg-surface-alt px-4 py-2 text-sm text-on-surface-strong placeholder:text-on-surface-weak focus:outline-none focus:ring-1 focus:ring-primary"
      />
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
