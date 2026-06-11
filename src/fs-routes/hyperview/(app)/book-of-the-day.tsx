import { createRoute } from "hono-fsr";
import { hyperview } from "../../../lib/hxml";
import { Text, View } from "../../../lib/hxml-comps";
import { AppLayout } from "../+layout";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { getRecentBooksOfTheDay } from "../../../features/app/BOTDServices";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";
import SectionHeader, {
  sectionHeaderStyles,
} from "../../../features/hyperview/components/SectionHeader";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import ThisWeekBookEntry, {
  thisWeekBookEntryStyles,
} from "../../../features/hyperview/components/spotlight/ThisWeekBookEntry";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, result] = await getRecentBooksOfTheDay();
  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  const botdEntries = result?.botdEntries ?? [];

  return hv(
    <AppLayout
      title="Books of the Day"
      baseUrl={baseUrl}
      user={user}
      showDock
      fixedHeader
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        {botdEntries.length > 0 ? (
          botdEntries.map((entry) => (
            <ThisWeekBookEntry key={entry.id} entry={entry} baseUrl={baseUrl} />
          ))
        ) : (
          <Text style="featured-empty-hint">No books of the day yet.</Text>
        )}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {sectionHeaderStyles()}
    {thisWeekBookEntryStyles()}
  </>
);
