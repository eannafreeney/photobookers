import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../../lib/hxml-comps.js";
function truncateWords(text, maxWords) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { preview: text.trim(), needsToggle: false };
  }
  return {
    preview: `${words.slice(0, maxWords).join(" ")}\u2026`,
    needsToggle: true
  };
}
const ExpandableBio = ({
  bio,
  id,
  textStyle = "spotlight-body-text",
  maxWords = 40
}) => {
  const collapsedId = `spotlight-bio-collapsed-${id}`;
  const expandedId = `spotlight-bio-expanded-${id}`;
  const { preview, needsToggle } = truncateWords(bio, maxWords);
  if (!needsToggle) {
    return /* @__PURE__ */ jsx(Text, { style: textStyle, children: bio });
  }
  return /* @__PURE__ */ jsxs(View, { children: [
    /* @__PURE__ */ jsxs(View, { id: collapsedId, children: [
      /* @__PURE__ */ jsx(Text, { style: textStyle, children: preview }),
      /* @__PURE__ */ jsxs(View, { style: "spotlight-bio-toggle", children: [
        /* @__PURE__ */ jsx(Text, { style: "spotlight-bio-toggle-label", children: "See more" }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: collapsedId }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: expandedId })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(View, { id: expandedId, hide: "true", children: [
      /* @__PURE__ */ jsx(Text, { style: textStyle, children: bio }),
      /* @__PURE__ */ jsxs(View, { style: "spotlight-bio-toggle", children: [
        /* @__PURE__ */ jsx(Text, { style: "spotlight-bio-toggle-label", children: "Show less" }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: collapsedId }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: expandedId })
      ] })
    ] })
  ] });
};
var ExpandableBio_default = ExpandableBio;
const expandableBioStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "spotlight-bio-toggle", paddingTop: 4, paddingBottom: 4 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-bio-toggle-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#a22c29"
    }
  )
] });
export {
  ExpandableBio_default as default,
  expandableBioStyles
};
