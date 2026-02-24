type SortDropdownProps = {
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
  currentPath: string;
};

const SORT_LABELS: Record<
  "newest" | "oldest" | "title_asc" | "title_desc",
  string
> = {
  newest: "Newest first",
  oldest: "Oldest first",
  title_asc: "Title (A–Z)",
  title_desc: "Title (Z–A)",
};

const SortDropdown = ({ sortBy, currentPath }: SortDropdownProps) => {
  const sortLabel = SORT_LABELS[sortBy];
  const linkClass =
    "bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-surface-dark-alt/5 hover:text-on-surface-strong focus-visible:bg-surface-dark-alt/10 focus-visible:text-on-surface-strong focus-visible:outline-hidden";
  const sortParam = (value: SortDropdownProps["sortBy"]) =>
    `${currentPath}${currentPath.includes("?") ? "&" : "?"}sortBy=${value}`;

  const parentAttrs = {
    "x-data": "{ isOpen: false, openedWithKeyboard: false }",
    "x-on:keydown.esc.prevent": "isOpen = false, openedWithKeyboard = false",
    "x-on:click.outside": "isOpen = false, openedWithKeyboard = false",
  };

  const buttonAttrs = {
    "x-on:click": "isOpen = true",
    "x-on:keydown.space.prevent": "openedWithKeyboard = true",
    "x-on:keydown.enter.prevent": "openedWithKeyboard = true",
    "x-on:keydown.down.prevent": "openedWithKeyboard = true",
    "x-bind:class":
      "isOpen || openedWithKeyboard ? 'text-on-surface-strong dark:text-on-surface-dark-strong' : 'text-on-surface dark:text-on-surface-dark'",
    "x-bind:aria-expanded": "isOpen || openedWithKeyboard",
  };

  const dropdownAttrs = {
    "x-cloak": "",
    "x-show": "isOpen || openedWithKeyboard",
    "x-transition": "",
    "x-trap": "openedWithKeyboard",
    "x-on:click.outside": "isOpen = false, openedWithKeyboard = false",
    "x-on:keydown.down.prevent": "$focus.wrap().next()",
    "x-on:keydown.up.prevent": "$focus.wrap().previous()",
  };

  return (
    <>
      <div {...parentAttrs} class="relative w-fit">
        <button
          type="button"
          {...buttonAttrs}
          class="inline-flex items-center gap-2 whitespace-nowrap rounded-radius border border-outline bg-surface-alt px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline-strong"
          aria-haspopup="true"
        >
          {sortLabel}
          <svg
            aria-hidden="true"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-4 w-4 rotate-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
        <div
          {...dropdownAttrs}
          class="absolute top-11 -left-6 flex w-fit min-w-40 flex-col overflow-hidden rounded-radius border border-outline bg-surface-alt py-1.5"
          role="menu"
        >
          <a href={currentPath} class={linkClass} role="menuitem">
            Newest first
          </a>
          <a href={sortParam("oldest")} class={linkClass} role="menuitem">
            Oldest first
          </a>
          <a href={sortParam("title_asc")} class={linkClass} role="menuitem">
            Title (A–Z)
          </a>
          <a href={sortParam("title_desc")} class={linkClass} role="menuitem">
            Title (Z–A)
          </a>
        </div>
      </div>
    </>
  );
};

export default SortDropdown;
