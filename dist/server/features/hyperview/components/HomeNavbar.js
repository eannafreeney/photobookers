import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import { xmlText } from "../../../lib/hxml.js";
import HeaderIconButton, { headerIconButtonStyles } from "./HeaderIconButton.js";
const HomeNavbar = ({ baseUrl, user }) => {
  return /* @__PURE__ */ jsx(
    View,
    {
      xmlns: "https://hyperview.org/hyperview",
      style: "featured-header-safe",
      "safe-area": "true",
      children: /* @__PURE__ */ jsx(View, { style: "featured-header", children: /* @__PURE__ */ jsxs(View, { style: "featured-header-inner", children: [
        /* @__PURE__ */ jsx(View, { style: "featured-header-center", children: /* @__PURE__ */ jsx(Text, { style: "featured-header-logo", children: xmlText("photobookers") }) }),
        /* @__PURE__ */ jsx(View, { style: "featured-header-side-left", children: baseUrl && !user ? /* @__PURE__ */ jsx(
          HeaderIconButton,
          {
            href: `${baseUrl}/hyperview/login`,
            icon: `${baseUrl}/icons/header/login.png`
          }
        ) : baseUrl ? /* @__PURE__ */ jsx(
          HeaderIconButton,
          {
            href: `${baseUrl}/hyperview/logout`,
            icon: `${baseUrl}/icons/header/logout.png`
          }
        ) : null }),
        /* @__PURE__ */ jsx(View, { style: "featured-header-side-right", children: baseUrl ? /* @__PURE__ */ jsx(
          HeaderIconButton,
          {
            href: `${baseUrl}/hyperview/search`,
            icon: `${baseUrl}/icons/header/search.png`
          }
        ) : null })
      ] }) })
    }
  );
};
var HomeNavbar_default = HomeNavbar;
const homeNavbarStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-safe",
      width: "100%",
      backgroundColor: "#fbfaf7",
      borderBottomWidth: 2,
      borderBottomColor: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header",
      width: "100%",
      paddingBottom: 12,
      paddingLeft: 12,
      paddingRight: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-inner",
      position: "relative",
      flex: 1,
      width: "100%",
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: 72,
      paddingRight: 72
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-side-left",
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-side-right",
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-center",
      flexShrink: 0,
      zIndex: 1,
      alignItems: "center",
      justifyContent: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-header-logo",
      fontFamily: "Caveat-SemiBold",
      fontSize: 28,
      fontWeight: 400,
      color: "#191613",
      letterSpacing: 0.5
    }
  ),
  headerIconButtonStyles()
] });
export {
  HomeNavbar_default as default,
  homeNavbarStyles
};
