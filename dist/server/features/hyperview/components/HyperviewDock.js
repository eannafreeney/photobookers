import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
const DOCK_ITEMS = [
  { id: "home", label: "Home", path: "featured", icon: "home" },
  { id: "creators", label: "Creators", path: "creators", icon: "creators" },
  { id: "books", label: "Books", path: "books", icon: "books" },
  // { id: "search", label: "search", path: "search", icon: "search" },
  { id: "favorites", label: "Favorites", path: "favorites", icon: "favorites" },
  { id: "about", label: "About", path: "about", icon: "about" }
];
const labelStyle = (isActive) => isActive ? "dock-label-active" : "dock-label";
const iconStyle = (isActive) => isActive ? "dock-icon-active" : "dock-icon";
const HyperviewDock = ({ baseUrl, active }) => {
  return /* @__PURE__ */ jsx(View, { style: "dock", children: DOCK_ITEMS.map(({ id, label, path, icon }) => {
    const isActive = active === id;
    return /* @__PURE__ */ jsxs(View, { style: "dock-item", children: [
      /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/${path}` }),
      /* @__PURE__ */ jsx(
        Image,
        {
          source: `${baseUrl}/icons/dock/${icon}.png`,
          style: iconStyle(isActive),
          "resize-mode": "contain"
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: labelStyle(isActive), children: label.toUpperCase() })
    ] });
  }) });
};
var HyperviewDock_default = HyperviewDock;
const dockShellStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "shell-column",
      flex: 1,
      flexDirection: "column",
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "shell-scroll", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "dock",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingTop: 12,
      paddingBottom: 20,
      marginBottom: 24,
      paddingLeft: 8,
      paddingRight: 8,
      borderTopWidth: 2,
      borderTopColor: "#191613",
      backgroundColor: "#fbfaf7",
      height: 56
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "dock-item", flex: 1, alignItems: "center", paddingTop: 2 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "dock-icon",
      width: 22,
      height: 22,
      tintColor: "#a39d90",
      marginBottom: 2
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "dock-icon-active",
      width: 22,
      height: 22,
      marginBottom: 2,
      tintColor: "#a22c29"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "dock-label",
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 1,
      color: "#a39d90"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "dock-label-active",
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1,
      color: "#a22c29"
    }
  )
] });
export {
  HyperviewDock_default as default,
  dockShellStyles
};
