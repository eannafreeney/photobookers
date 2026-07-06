import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Image,
  ScrollView,
  Style,
  View
} from "../../../lib/hxml-comps.js";
const BookGallery = ({ galleryImages }) => {
  const urls = galleryImages.filter((url) => Boolean(url));
  if (urls.length === 0) return null;
  return /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsxs(View, { style: "gallery-stack", children: [
    /* @__PURE__ */ jsx(View, { id: "gallery-hero-slot", style: "gallery-hero-wrap", children: /* @__PURE__ */ jsx(
      Image,
      {
        source: urls[0],
        style: "gallery-hero-image",
        "resize-mode": "contain"
      }
    ) }),
    /* @__PURE__ */ jsx(View, { hide: "true", children: urls.map((url, i) => /* @__PURE__ */ jsx(View, { id: `gallery-hero-frag-${i}`, children: /* @__PURE__ */ jsx(
      Image,
      {
        source: url,
        style: "gallery-hero-image",
        "resize-mode": "contain"
      }
    ) }, `frag-${i}`)) }),
    /* @__PURE__ */ jsx(ScrollView, { style: "gallery-thumbs", horizontal: "true", children: urls.map((url, i) => /* @__PURE__ */ jsxs(View, { style: "gallery-thumb-cell", children: [
      /* @__PURE__ */ jsx(
        Behavior,
        {
          action: "replace-inner",
          target: "gallery-hero-slot",
          href: `#gallery-hero-frag-${i}`
        }
      ),
      /* @__PURE__ */ jsx(
        Image,
        {
          source: url,
          style: "gallery-thumb-image",
          "resize-mode": "cover"
        }
      )
    ] }, `thumb-${i}`)) })
  ] }) });
};
var BookGallery_default = BookGallery;
const bookGalleryStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery-stack",
      marginLeft: -16,
      marginRight: -16,
      marginTop: -16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "gallery-hero-wrap", width: "100%" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery-hero-image",
      width: "100%",
      height: 320,
      resizeMode: "contain"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery-thumbs",
      flexDirection: "row",
      height: 56,
      marginTop: 4,
      paddingLeft: 4,
      paddingRight: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery-thumb-cell",
      width: 56,
      height: 56,
      marginRight: 4,
      alignItems: "center",
      justifyContent: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery-thumb-image",
      width: 56,
      height: 56,
      borderRadius: 0,
      borderWidth: 0,
      opacity: 0.85
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery-thumb-selected",
      width: 56,
      height: 56,
      borderRadius: 0,
      borderWidth: 0,
      opacity: 1
    }
  )
] });
export {
  bookGalleryStyles,
  BookGallery_default as default
};
