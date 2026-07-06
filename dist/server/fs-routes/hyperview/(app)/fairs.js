import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { Behavior, Spinner, Style, View } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import FairsTabs, {
  FAIRS_TAB_TARGET_ID,
  fairsTabStyles
} from "../../../features/hyperview/components/FairsTabs.js";
import { fairsListStyles } from "../../../features/hyperview/components/FairsList.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
const DEFAULT_FAIRS_TAB = "current";
const defaultTabHref = (baseUrl) => `${baseUrl}/hyperview/fairs/tab/${DEFAULT_FAIRS_TAB}`;
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  if (!isFeatureEnabledForUser("fairs", user)) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Not found" }),
      404
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        showDock: true,
        title: "Book Fairs",
        user,
        baseUrl,
        dockActive: "home",
        extraStyles: pageStyles(),
        dockScrollRefreshHref: `${baseUrl}/hyperview/fairs`,
        children: /* @__PURE__ */ jsxs(View, { style: "page-content", children: [
          /* @__PURE__ */ jsx(FairsTabs, { baseUrl, activeTab: DEFAULT_FAIRS_TAB }),
          /* @__PURE__ */ jsx(View, { id: "fairs-tab-spinner", style: "fairs-tab-spinner", hide: "true", children: /* @__PURE__ */ jsx(Spinner, {}) }),
          /* @__PURE__ */ jsx(View, { id: FAIRS_TAB_TARGET_ID, style: "page-content", children: /* @__PURE__ */ jsx(
            Behavior,
            {
              trigger: "load",
              verb: "get",
              action: "replace-inner",
              target: FAIRS_TAB_TARGET_ID,
              href: defaultTabHref(baseUrl),
              "hide-during-load": FAIRS_TAB_TARGET_ID,
              "show-during-load": "fairs-tab-spinner"
            }
          ) })
        ] })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fairs-tab-spinner",
      flex: 1,
      minHeight: 240,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 48
    }
  ),
  fairsTabStyles(),
  fairsListStyles(),
  signInEmptyHintStyles()
] });
export {
  GET
};
