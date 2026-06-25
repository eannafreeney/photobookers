import type { Child } from "hono/jsx";

type CollapsibleFiltersProps = {
  activeFilterCount: number;
  controlsId: string;
  desktopGridClass: string;
  children: Child;
};

const CollapsibleFilters = ({
  activeFilterCount,
  controlsId,
  desktopGridClass,
  children,
}: CollapsibleFiltersProps) => (
  <div
    x-data={`{
      open: false,
      activeFilterCount: ${activeFilterCount},
      toggle() { this.open = !this.open },
      toggleLabel() {
        const countLabel = this.activeFilterCount > 0
          ? ' (' + this.activeFilterCount + ' active)'
          : '';
        return (this.open ? 'Hide filters' : 'Show filters') + countLabel;
      }
    }`}
    x-init="if (window.innerWidth >= 768) open = true"
  >
    <button
      type="button"
      class="mb-3 flex w-full items-center justify-between rounded border-2 border-on-surface-strong bg-surface-container-low px-4 py-3 text-left text-sm font-medium text-on-surface-strong md:hidden"
      x-on:click="toggle()"
      x-bind:aria-expanded="open ? 'true' : 'false'"
      aria-controls={controlsId}
    >
      <span>Filters</span>
      <span x-text="toggleLabel()"></span>
    </button>
    <div
      id={controlsId}
      class={`grid grid-cols-1 gap-4 rounded border-2 border-on-surface-strong bg-surface-container-low p-4 ${desktopGridClass}`}
      x-cloak
      x-show="open"
    >
      {children}
    </div>
  </div>
);

export default CollapsibleFilters;
