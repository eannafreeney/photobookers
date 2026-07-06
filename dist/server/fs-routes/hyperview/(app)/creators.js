import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { filterPublishedCreators } from "../../../features/app/services.js";
import { AppLayout, SHELL_SCROLL_ID } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { Behavior, Spinner, Style, Text, View } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import CreatorsTabs, {
  creatorsTabStyles
} from "../../../features/hyperview/components/CreatorsTabs.js";
import CreatorsList, {
  creatorsListStyles
} from "../../../features/hyperview/components/CreatorsList.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import { signInPromptStyles } from "../../../features/hyperview/components/SignInPrompt.js";
import CreatorsFilterForm, {
  CREATORS_SEARCH_BAR_ID,
  CREATORS_TAB_TARGET_ID,
  creatorsFilterFormStyles
} from "../../../features/hyperview/components/CreatorsFilterForm.js";
const DEFAULT_CREATORS_TAB = "all";
const defaultTabHref = (baseUrl) => `${baseUrl}/hyperview/creators/tab/${DEFAULT_CREATORS_TAB}`;
const renderDefaultTabArea = (baseUrl) => /* @__PURE__ */ jsx(View, { id: CREATORS_TAB_TARGET_ID, style: "page-content", children: /* @__PURE__ */ jsx(
  Behavior,
  {
    trigger: "load",
    verb: "get",
    action: "replace-inner",
    target: CREATORS_TAB_TARGET_ID,
    href: defaultTabHref(baseUrl),
    "hide-during-load": "tab-area",
    "show-during-load": "tab-spinner"
  }
) });
const renderCreatorsTabArea = (baseUrl, creators, filtering) => /* @__PURE__ */ jsx(
  View,
  {
    id: CREATORS_TAB_TARGET_ID,
    xmlns: "https://hyperview.org/hyperview",
    style: "page-content",
    children: /* @__PURE__ */ jsx("view", { style: "tab-fragment", children: filtering && creators.length === 0 ? /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No creators found." }) : /* @__PURE__ */ jsx(
      CreatorsList,
      {
        creators,
        baseUrl,
        page: 1,
        hasMore: false
      }
    ) })
  }
);
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsxs(
      AppLayout,
      {
        isSearch: true,
        showDock: true,
        title: "Creators",
        user,
        baseUrl,
        dockActive: "creators",
        extraStyles: pageStyles(),
        searchToggleTarget: CREATORS_SEARCH_BAR_ID,
        searchScrollToTopTarget: SHELL_SCROLL_ID,
        dockScrollRefreshHref: `${baseUrl}/hyperview/creators`,
        children: [
          /* @__PURE__ */ jsx(
            View,
            {
              id: CREATORS_SEARCH_BAR_ID,
              style: "creators-search-bar",
              hide: "true",
              sticky: "true",
              children: /* @__PURE__ */ jsx(CreatorsFilterForm, { baseUrl })
            }
          ),
          /* @__PURE__ */ jsx(CreatorsTabs, { baseUrl, activeTab: DEFAULT_CREATORS_TAB }),
          /* @__PURE__ */ jsx(View, { id: "tab-spinner", style: "creators-tab-spinner", hide: "true", children: /* @__PURE__ */ jsx(Spinner, {}) }),
          renderDefaultTabArea(baseUrl)
        ]
      }
    )
  );
});
const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const q = String((await c.req.formData()).get("q") ?? "").trim();
  const filtering = q.length > 0;
  if (!filtering) {
    return hv(
      /* @__PURE__ */ jsx(
        View,
        {
          id: CREATORS_TAB_TARGET_ID,
          xmlns: "https://hyperview.org/hyperview",
          style: "page-content",
          children: /* @__PURE__ */ jsx(
            Behavior,
            {
              trigger: "load",
              verb: "get",
              action: "replace-inner",
              target: CREATORS_TAB_TARGET_ID,
              href: defaultTabHref(baseUrl),
              "hide-during-load": "tab-area",
              "show-during-load": "tab-spinner"
            }
          )
        }
      )
    );
  }
  const [error, result] = await filterPublishedCreators(q, 50);
  if (error || !result) {
    return hv(
      /* @__PURE__ */ jsx(
        View,
        {
          id: CREATORS_TAB_TARGET_ID,
          xmlns: "https://hyperview.org/hyperview",
          style: "page-content",
          children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Could not filter creators." })
        }
      )
    );
  }
  const creators = result.creators ?? [];
  return hv(renderCreatorsTabArea(baseUrl, creators, filtering));
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "creators-tab-spinner",
      flex: 1,
      minHeight: 240,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 48
    }
  ),
  creatorsTabStyles(),
  creatorsListStyles(),
  creatorsFilterFormStyles(),
  signInEmptyHintStyles(),
  signInPromptStyles()
] });
export {
  GET,
  POST
};
