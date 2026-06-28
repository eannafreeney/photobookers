import { createRoute } from "hono-fsr";
import { hyperview } from "../../../lib/hxml";
import { View } from "../../../lib/hxml-comps";
import { AppLayout } from "../+layout";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { getBooksOfTheDayInRange } from "../../../features/app/BOTDServices";
import { getArtistOfTheWeekForDateQuery } from "../../../features/app/AOTWServices";
import { getPublisherOfTheWeekForDateQuery } from "../../../features/app/POTWServices";
import { formatWeekRangeLabel } from "../../../domain/planner/newsletterUtils";
import {
  capEndOfDayToToday,
  parseWeekString,
  toWeekStart,
} from "../../../lib/utils";
import ThisWeekSpotlightBody, {
  thisWeekSpotlightPageStyles,
} from "../../../features/hyperview/components/spotlight/ThisWeekSpotlightBody";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const weekParam = c.req.query("week");
  const weekStart = weekParam
    ? parseWeekString(weekParam)
    : toWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const [
    [botdErr, botdResult],
    [artistErr, artistOfTheWeek],
    [publisherErr, publisherOfTheWeek],
  ] = await Promise.all([
    getBooksOfTheDayInRange(weekStart, capEndOfDayToToday(weekEnd)),
    getArtistOfTheWeekForDateQuery(weekStart),
    getPublisherOfTheWeekForDateQuery(weekStart),
  ]);

  const weekRangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const botdEntries = !botdErr ? botdResult.botdEntries : [];

  return hv(
    <AppLayout
      title="This week"
      baseUrl={baseUrl}
      user={user}
      showDock
      fixedHeader
      extraStyles={thisWeekSpotlightPageStyles()}
    >
      <View style="page-content">
        <ThisWeekSpotlightBody
          baseUrl={baseUrl}
          weekStart={weekStart}
          weekRangeLabel={weekRangeLabel}
          botdEntries={botdEntries}
          artistOfTheWeek={
            !artistErr && artistOfTheWeek ? artistOfTheWeek : null
          }
          publisherOfTheWeek={
            !publisherErr && publisherOfTheWeek ? publisherOfTheWeek : null
          }
        />
      </View>
    </AppLayout>,
  );
});
