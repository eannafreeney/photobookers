import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const CollapsibleFilters = ({
  activeFilterCount,
  controlsId,
  desktopGridClass,
  children
}) => /* @__PURE__ */ jsxs(
  "div",
  {
    "x-data": `{
      open: false,
      activeFilterCount: ${activeFilterCount},
      toggle() { this.open = !this.open },
      toggleLabel() {
        const countLabel = this.activeFilterCount > 0
          ? ' (' + this.activeFilterCount + ' active)'
          : '';
        return (this.open ? 'Hide filters' : 'Show filters') + countLabel;
      }
    }`,
    "x-init": "if (window.innerWidth >= 768) open = true",
    children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          class: "mb-3 flex w-full items-center justify-between rounded border-2 border-on-surface-strong bg-surface-container-low px-4 py-3 text-left text-sm font-medium text-on-surface-strong md:hidden",
          "x-on:click": "toggle()",
          "x-bind:aria-expanded": "open ? 'true' : 'false'",
          "aria-controls": controlsId,
          children: [
            /* @__PURE__ */ jsx("span", { children: "Filters" }),
            /* @__PURE__ */ jsx("span", { "x-text": "toggleLabel()" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          id: controlsId,
          class: `grid grid-cols-1 gap-4 rounded border-2 border-on-surface-strong bg-surface-container-low p-4 ${desktopGridClass}`,
          "x-cloak": true,
          "x-show": "open",
          children
        }
      )
    ]
  }
);
var CollapsibleFilters_default = CollapsibleFilters;
export {
  CollapsibleFilters_default as default
};
