import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  formatClickRate,
  getCreatorCatalogueFunnelTotals
} from "../../../book-analytics/funnel.js";
const CreatorBookFunnelSummary = async ({ creatorId, creatorType }) => {
  const totals = await getCreatorCatalogueFunnelTotals(creatorId, creatorType);
  const clickRateLabel = formatClickRate(totals.views, totals.outboundClicks);
  return /* @__PURE__ */ jsxs("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: [
    /* @__PURE__ */ jsx("span", { class: "font-semibold text-on-surface-strong", children: "All time:" }),
    " ",
    totals.views.toLocaleString(),
    " views \xB7",
    " ",
    totals.favorites.toLocaleString(),
    " Favorited \xB7",
    " ",
    totals.outboundClicks.toLocaleString(),
    " outbound clicks",
    clickRateLabel ? ` (${clickRateLabel} click rate)` : null
  ] });
};
var CreatorBookFunnelSummary_default = CreatorBookFunnelSummary;
export {
  CreatorBookFunnelSummary_default as default
};
