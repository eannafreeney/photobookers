import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../lib/hxml.js";
import { Text, View } from "../../../lib/hxml-comps.js";
import { AppLayout } from "../+layout.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { getRecentBooksOfTheDay } from "../../../features/app/BOTDServices.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
import {
  sectionHeaderStyles
} from "../../../features/hyperview/components/SectionHeader.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ThisWeekBookEntry, {
  thisWeekBookEntryStyles
} from "../../../features/hyperview/components/spotlight/ThisWeekBookEntry.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, result] = await getRecentBooksOfTheDay();
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  const botdEntries = result?.botdEntries ?? [];
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Books of the Day",
        baseUrl,
        user,
        showDock: true,
        fixedHeader: true,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: botdEntries.length > 0 ? botdEntries.map((entry) => /* @__PURE__ */ jsx(ThisWeekBookEntry, { entry, baseUrl }, entry.id)) : /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No books of the day yet." }) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  sectionHeaderStyles(),
  thisWeekBookEntryStyles()
] });
export {
  GET
};
