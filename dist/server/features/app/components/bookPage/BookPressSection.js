import { jsx, jsxs } from "hono/jsx/jsx-runtime";
function hostLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
const BookPressSection = ({ links }) => {
  if (!links?.length) return null;
  return /* @__PURE__ */ jsxs("section", { class: "space-y-3", "aria-labelledby": "book-press-heading", children: [
    /* @__PURE__ */ jsx(
      "h2",
      {
        id: "book-press-heading",
        class: "text-xs font-semibold uppercase tracking-[0.16em] text-on-surface/70",
        children: "Press"
      }
    ),
    /* @__PURE__ */ jsx("ul", { class: "space-y-4", children: links.map((link) => /* @__PURE__ */ jsxs("li", { class: "space-y-1", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: link.url,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "font-medium text-on-surface-strong underline-offset-2 hover:underline",
          children: link.title
        }
      ),
      /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface/60", children: hostLabel(link.url) }),
      link.quote ? /* @__PURE__ */ jsx("blockquote", { class: "border-l-2 border-outline pl-3 text-sm italic text-on-surface/80", children: link.quote }) : null
    ] }, link.url)) })
  ] });
};
var BookPressSection_default = BookPressSection;
export {
  BookPressSection_default as default
};
