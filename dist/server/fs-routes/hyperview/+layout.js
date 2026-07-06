import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Doc,
  Screen,
  Body,
  Styles,
  Style,
  ScrollView,
  View
} from "../../lib/hxml-comps.js";
import HyperviewDock, {
  dockShellStyles
} from "../../features/hyperview/components/HyperviewDock.js";
import HomeNavbar, {
  homeNavbarStyles
} from "../../features/hyperview/components/HomeNavbar.js";
import CustomHeader, {
  customHeaderStyles
} from "../../features/hyperview/components/CustomHeader.js";
const SHELL_SCROLL_ID = "shell-scroll";
const AppLayout = ({
  title,
  coverUrl,
  children,
  extraStyles,
  isVerified = false,
  showBackButton = true,
  headerVariant = "default",
  showDock = false,
  fixedHeader = false,
  baseUrl,
  dockActive,
  artist,
  publisher,
  user,
  nativeList = false,
  dockScrollRefreshHref,
  isSearch,
  searchToggleTarget,
  searchScrollToTopTarget,
  showClaimButton = false,
  claimHref
}) => {
  const docked = Boolean(showDock && baseUrl);
  const shellScroll = docked || fixedHeader;
  return /* @__PURE__ */ jsx(Doc, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsxs(Screen, { children: [
    /* @__PURE__ */ jsxs(Styles, { children: [
      baseStyles(),
      shellScroll ? dockShellStyles() : null,
      extraStyles
    ] }),
    /* @__PURE__ */ jsxs(Body, { style: "body", scroll: shellScroll ? "false" : "true", children: [
      headerVariant === "featured" ? /* @__PURE__ */ jsx(HomeNavbar, { baseUrl, user }) : /* @__PURE__ */ jsx(
        CustomHeader,
        {
          title,
          artist,
          publisher,
          showBackButton,
          isVerified,
          coverUrl,
          isSearch,
          baseUrl,
          searchToggleTarget,
          searchScrollToTopTarget,
          showClaimButton,
          claimHref
        }
      ),
      docked && baseUrl ? nativeList ? /* @__PURE__ */ jsxs(View, { style: "shell-column", children: [
        children,
        /* @__PURE__ */ jsx(HyperviewDock, { baseUrl, active: dockActive })
      ] }) : /* @__PURE__ */ jsxs(View, { style: "shell-column", children: [
        /* @__PURE__ */ jsx(
          ScrollView,
          {
            id: SHELL_SCROLL_ID,
            style: "shell-scroll",
            ...dockScrollRefreshHref ? {
              trigger: "refresh",
              action: "reload",
              href: dockScrollRefreshHref
            } : {},
            children
          }
        ),
        /* @__PURE__ */ jsx(HyperviewDock, { baseUrl, active: dockActive })
      ] }) : fixedHeader ? /* @__PURE__ */ jsx(View, { style: "shell-column", children: /* @__PURE__ */ jsx(ScrollView, { id: SHELL_SCROLL_ID, style: "shell-scroll", children }) }) : children
    ] })
  ] }) });
};
const baseStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "body",
      flex: 1,
      flexDirection: "column",
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "list", flex: 1 }),
  /* @__PURE__ */ jsx(Style, { id: "page-content", margin: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "page-content-no-margin-top",
      marginRight: 16,
      marginLeft: 16,
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "content", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-bar",
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5",
      alignItems: "center",
      justifyContent: "center",
      gap: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-btn",
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "tab-label",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.5,
      color: "#45413a"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "tab-content", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "header-search-wrap",
      paddingLeft: 8,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "header-search-btn", fontSize: 18, color: "#a22c29" }),
  homeNavbarStyles(),
  customHeaderStyles()
] });
export {
  AppLayout,
  SHELL_SCROLL_ID
};
