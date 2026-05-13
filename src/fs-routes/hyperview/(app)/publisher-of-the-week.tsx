import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { hyperview } from "../../../lib/hxml";
import { getRecentPublishersOfTheWeek } from "../../../features/app/POTWServices";
import { toWeekString } from "../../../lib/utils";
import { getBaseUrl } from "../../../lib/hyperview";
import { notFoundScreen } from "../../../lib/hxml-components";
import CreatorCard, {
  creatorCardStyles,
} from "../../../features/hyperview/components/CreatorCard";

export const GET = createRoute(async (c) => {
  const currentPage = Number(c.req.query("page") ?? 1);
  const baseUrl = getBaseUrl(c);
  const [error, result] = await getRecentPublishersOfTheWeek(currentPage);
  const hv = hyperview(c);

  if (error || !result) {
    return hv(notFoundScreen("Could not load publishers of the week."), 404);
  }

  const { potwEntries } = result;

  return hv(
    <AppLayout
      title="Publisher of the Week"
      extraStyles={publisherOfTheWeekStyles()}
    >
      <View id="page-content" style="page-content">
        {potwEntries.map((entry) => (
          <View key={entry.id} style="spotlight-entry">
            <Text style="spotlight-week-label">
              Week: {toWeekString(entry.weekStart)}
            </Text>
            <CreatorCard creator={entry.creator} baseUrl={baseUrl} />
          </View>
        ))}
      </View>
    </AppLayout>,
  );
});

const publisherOfTheWeekStyles = () => (
  <>
    <Style id="page-content" margin={16} />
    <Style
      id="spotlight-entry"
      flexDirection="column"
      gap={8}
      marginBottom={16}
    />
    <Style
      id="spotlight-week-label"
      fontSize={12}
      fontWeight="600"
      color="#111111"
    />
    {creatorCardStyles()}
  </>
);
