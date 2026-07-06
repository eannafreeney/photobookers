import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, View } from "../../../lib/hxml-comps.js";
const SEARCH_ACTIVE_COLOR = "#a22c29";
const searchIconToggleIds = (searchBarTarget) => ({
  idle: `${searchBarTarget}-icon-idle`,
  active: `${searchBarTarget}-icon-active`
});
const HeaderIconButton = ({
  href,
  icon,
  action = "push",
  target,
  scrollToTopTarget
}) => {
  const isSearchToggle = action === "toggle" && target;
  const iconIds = isSearchToggle ? searchIconToggleIds(target) : null;
  return /* @__PURE__ */ jsxs(View, { style: "featured-header-btn-wrap", children: [
    scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
    isSearchToggle && iconIds ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Behavior, { action: "toggle", target }),
      /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: iconIds.idle }),
      /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: iconIds.active })
    ] }) : /* @__PURE__ */ jsx(
      Behavior,
      {
        action,
        ...href ? { href } : {},
        ...target ? { target } : {}
      }
    ),
    iconIds ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(View, { id: iconIds.idle, style: "header-search-icon-layer", children: /* @__PURE__ */ jsx(
        Image,
        {
          source: icon,
          style: "featured-header-icon",
          "resize-mode": "contain"
        }
      ) }),
      /* @__PURE__ */ jsx(View, { id: iconIds.active, style: "header-search-icon-layer", hide: "true", children: /* @__PURE__ */ jsx(
        Image,
        {
          source: icon,
          style: "featured-header-icon",
          tintColor: SEARCH_ACTIVE_COLOR,
          "resize-mode": "contain"
        }
      ) })
    ] }) : /* @__PURE__ */ jsx(Image, { source: icon, style: "featured-header-icon", "resize-mode": "contain" })
  ] });
};
var HeaderIconButton_default = HeaderIconButton;
const headerIconButtonStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-btn-wrap",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
      children: /* @__PURE__ */ jsx("modifier", {})
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-icon",
      width: 22,
      height: 22,
      tintColor: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "header-search-icon-layer", width: 22, height: 22 })
] });
export {
  HeaderIconButton_default as default,
  headerIconButtonStyles
};
