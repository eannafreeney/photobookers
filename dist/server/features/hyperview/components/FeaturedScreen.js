import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FeaturedTabs, { featuredTabStyles } from "./FeaturedTabs.js";
import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_HOST_ID,
  FEATURED_TAB_SPINNER_ID
} from "./featuredTabIds.js";
import { AppLayout } from "../../../fs-routes/hyperview/+layout.js";
import {
  messageListStyles,
  signInEmptyHintStyles
} from "../hyperviewCommonScreenStyles.js";
import { Behavior, Spinner, Style, View } from "../../../lib/hxml-comps.js";
import { feedListStyles } from "./FeedList.js";
import { bookGroupsStyles } from "./BookGroups.js";
import { interviewsStyles } from "./Interviews.js";
import { trendingCreatorsStyles } from "./TrendingCreatorsSlider.js";
import { newsletterCardStyles } from "./NewsletterCard.js";
import { fairsSectionStyles } from "./FairsSection.js";
import { featuredHomeBodyStyles } from "./FeaturedHomeBody.js";
import { bookGridWithFiltersStyles } from "./BookGridWithFilters.js";
import { sectionHeaderStyles } from "./SectionHeader.js";
import { signInPromptStyles } from "./SignInPrompt.js";
const FeaturedScreen = ({ baseUrl, user, clearClientSession }) => /* @__PURE__ */ jsxs(
  AppLayout,
  {
    title: "Home",
    user,
    headerVariant: "featured",
    showBackButton: false,
    showDock: true,
    baseUrl,
    dockActive: "home",
    dockScrollRefreshHref: `${baseUrl}/hyperview/featured`,
    extraStyles: pageStyles(),
    children: [
      clearClientSession ? /* @__PURE__ */ jsx(View, { hide: "true", children: /* @__PURE__ */ jsx(Behavior, { trigger: "load", action: "sign-out-supabase" }) }) : null,
      /* @__PURE__ */ jsx(FeaturedTabs, { baseUrl, activeTab: "home" }),
      /* @__PURE__ */ jsxs(View, { id: FEATURED_TAB_HOST_ID, style: "featured-tab-panel", children: [
        /* @__PURE__ */ jsx(
          View,
          {
            id: FEATURED_TAB_SPINNER_ID,
            style: "featured-tab-spinner",
            hide: "true",
            children: /* @__PURE__ */ jsx(Spinner, {})
          }
        ),
        /* @__PURE__ */ jsx(View, { id: FEATURED_TAB_BODY_ID, style: "featured-tab-body", children: /* @__PURE__ */ jsx(
          Behavior,
          {
            trigger: "load",
            verb: "get",
            action: "replace-inner",
            target: FEATURED_TAB_BODY_ID,
            href: `${baseUrl}/hyperview/featured/tab/home-content`,
            "hide-during-load": FEATURED_TAB_BODY_ID,
            "show-during-load": FEATURED_TAB_SPINNER_ID
          }
        ) })
      ] })
    ]
  }
);
var FeaturedScreen_default = FeaturedScreen;
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1 }),
  signInEmptyHintStyles(),
  signInPromptStyles(),
  featuredTabStyles(),
  messageListStyles(),
  feedListStyles(),
  sectionHeaderStyles(),
  bookGroupsStyles(),
  interviewsStyles(),
  trendingCreatorsStyles(),
  newsletterCardStyles(),
  featuredHomeBodyStyles(),
  fairsSectionStyles(),
  bookGridWithFiltersStyles()
] });
export {
  FeaturedScreen_default as default
};
