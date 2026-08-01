import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const ThemeGenerator = () => {
  const alpineAttrs = {
    "x-target": "magazine-issues-table",
    "x-data": "{ loading: false }",
    "x-on:submit": "loading = true"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      method: "post",
      action: "/dashboard/admin/magazine/generate",
      class: "flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-4 sm:flex-row sm:items-end",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsxs("label", { class: "flex flex-1 flex-col gap-1", children: [
          /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface", children: "Theme seed (optional)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "seed",
              placeholder: "e.g. water, ritual, the city at night \u2014 or leave blank to surprise",
              class: "w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            "x-bind:disabled": "loading",
            class: "border cursor-pointer border-accent bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent/90 disabled:opacity-60",
            children: [
              /* @__PURE__ */ jsx("span", { "x-show": "!loading", children: "\u2728 Generate draft" }),
              /* @__PURE__ */ jsx("span", { "x-show": "loading", "x-cloak": true, children: "Generating\u2026 (up to a minute)" })
            ]
          }
        )
      ]
    }
  );
};
var ThemeGenerator_default = ThemeGenerator;
export {
  ThemeGenerator_default as default
};
