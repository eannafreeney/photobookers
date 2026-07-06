import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const DEFAULT_MAX_WORDS = 75;
function truncateWords(text, maxWords) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { preview: text.trim(), needsTruncate: false };
  }
  return {
    preview: `${words.slice(0, maxWords).join(" ")}\u2026`,
    needsTruncate: true
  };
}
const ExpandableDescription = ({
  text,
  maxWords = DEFAULT_MAX_WORDS
}) => {
  const { preview, needsTruncate } = truncateWords(text, maxWords);
  return /* @__PURE__ */ jsxs("div", { "x-data": "{ expanded: false }", class: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx(
      "p",
      {
        class: "text-pretty text-base leading-relaxed text-on-surface whitespace-pre-wrap ",
        "x-show": "!expanded",
        children: preview
      }
    ),
    needsTruncate ? /* @__PURE__ */ jsx(
      "p",
      {
        "x-cloak": true,
        "x-show": "expanded",
        class: "text-pretty text-base leading-relaxed text-on-surface whitespace-pre-wrap ",
        children: text
      }
    ) : null,
    needsTruncate ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        class: "self-start kicker text-accent underline underline-offset-4 cursor-pointer",
        "x-on:click": "expanded = !expanded",
        "x-text": "expanded ? 'Show less' : 'See more'"
      }
    ) : null
  ] });
};
var ExpandableDescription_default = ExpandableDescription;
export {
  ExpandableDescription_default as default
};
