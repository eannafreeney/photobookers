import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import IssueBookCard from "./IssueBookCard.js";
const SelectedBooksList = ({ issue, action }) => {
  const count = issue.placements.length;
  return /* @__PURE__ */ jsx("ul", { id: "magazine-books", class: "flex flex-col gap-2", children: issue.placements.map((item) => /* @__PURE__ */ jsx(IssueBookCard, { ...item, count, action })) });
};
const SelectedBooks = ({ issue, action }) => {
  return /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-6 border-t border-outline pt-4", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Books" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `${action}/add-book`,
          "x-target": "modal-root",
          class: "inline-flex items-center gap-1 border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:border-accent hover:text-accent",
          children: "+ Add book"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(SelectedBooksList, { issue, action })
  ] });
};
var SelectedBooks_default = SelectedBooks;
export {
  SelectedBooksList,
  SelectedBooks_default as default
};
