import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import AboutContent, {
  aboutContentStyles
} from "../../../features/hyperview/components/AboutContent.js";
import { settingsTabStyles } from "../../../features/hyperview/components/SettingsTabs.js";
import { legalTextStyles } from "../../../features/hyperview/components/LegalText.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsxs(
      AppLayout,
      {
        title: "About",
        user,
        showDock: true,
        baseUrl,
        dockActive: "about",
        extraStyles: pageStyles(),
        children: [
          /* @__PURE__ */ jsx(AboutContent, {}),
          /* @__PURE__ */ jsxs(View, { style: "settings-links", children: [
            /* @__PURE__ */ jsxs(View, { style: "settings-link-btn", children: [
              /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/terms` }),
              /* @__PURE__ */ jsx(Text, { style: "settings-link-label", children: "Terms" })
            ] }),
            /* @__PURE__ */ jsxs(View, { style: "settings-link-btn", children: [
              /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/privacy` }),
              /* @__PURE__ */ jsx(Text, { style: "settings-link-label", children: "Privacy" })
            ] })
          ] })
        ]
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "settings-tab-area", margin: 16, flex: 1 }),
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "settings-tab-spinner",
      flex: 1,
      minHeight: 240,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 48
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "settings-links",
      flexDirection: "column",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "settings-link-btn",
      backgroundColor: "#fbfaf7",
      borderWidth: 1,
      borderColor: "#a39d90",
      borderRadius: 0,
      paddingTop: 16,
      paddingBottom: 16,
      alignItems: "center",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "settings-link-label",
      color: "#191613",
      fontWeight: "600",
      fontSize: 16
    }
  ),
  aboutContentStyles(),
  settingsTabStyles(),
  legalTextStyles()
] });
export {
  GET
};
