import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../lib/hxml.js";
import { View } from "../../../lib/hxml-comps.js";
import { AppLayout } from "../+layout.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { getBooksOfTheDayInRange } from "../../../features/app/BOTDServices.js";
import { getArtistOfTheWeekForDateQuery } from "../../../features/app/AOTWServices.js";
import { getPublisherOfTheWeekForDateQuery } from "../../../features/app/POTWServices.js";
import { formatWeekRangeLabel } from "../../../domain/planner/newsletterUtils.js";
import {
  capEndOfDayToToday,
  parseWeekString,
  toWeekStart
} from "../../../lib/utils.js";
import ThisWeekSpotlightBody, {
  thisWeekSpotlightPageStyles
} from "../../../features/hyperview/components/spotlight/ThisWeekSpotlightBody.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const weekParam = c.req.query("week");
  const weekStart = weekParam ? parseWeekString(weekParam) : toWeekStart(/* @__PURE__ */ new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const [
    [botdErr, botdResult],
    [artistErr, artistOfTheWeek],
    [publisherErr, publisherOfTheWeek]
  ] = await Promise.all([
    getBooksOfTheDayInRange(weekStart, capEndOfDayToToday(weekEnd)),
    getArtistOfTheWeekForDateQuery(weekStart),
    getPublisherOfTheWeekForDateQuery(weekStart)
  ]);
  const weekRangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const botdEntries = !botdErr ? botdResult.botdEntries : [];
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "This week",
        baseUrl,
        user,
        showDock: true,
        fixedHeader: true,
        extraStyles: thisWeekSpotlightPageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(
          ThisWeekSpotlightBody,
          {
            baseUrl,
            weekStart,
            weekRangeLabel,
            botdEntries,
            artistOfTheWeek: !artistErr && artistOfTheWeek ? artistOfTheWeek : null,
            publisherOfTheWeek: !publisherErr && publisherOfTheWeek ? publisherOfTheWeek : null
          }
        ) })
      }
    )
  );
});
export {
  GET
};
