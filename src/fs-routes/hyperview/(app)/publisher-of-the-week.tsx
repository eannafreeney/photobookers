import { createRoute } from "hono-fsr";
import { hyperview } from "../../../lib/hxml";
import { Style, Text, View, Image, Behavior } from "../../../lib/hxml-comps";
import { AppLayout } from "../+layout";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { getRecentPublishersOfTheWeek } from "../../../features/app/POTWServices";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { formatOrdinalDate } from "../../../lib/utils";
import { potwPath } from "../../../features/app/spotlightUrls";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, result] = await getRecentPublishersOfTheWeek();
  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  const entries = result?.potwEntries ?? [];

  return hv(
    <AppLayout
      title="Publishers of the Week"
      baseUrl={baseUrl}
      user={user}
      showDock
      fixedHeader
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <View style="spotlight-entry">
              {entry.creator.coverUrl ? (
                <Image source={entry.creator.coverUrl} style="spotlight-cover" />
              ) : null}
              <Text style="spotlight-date">
                {`WEEK OF ${formatOrdinalDate(entry.weekStart).toUpperCase()}`}
              </Text>
              <Text style="spotlight-title">{entry.creator.displayName}</Text>
              <View style="spotlight-btn">
                <Text style="spotlight-btn-label">View</Text>
                <Behavior href={`${baseUrl}/hyperview${potwPath(entry.weekStart)}`} />
              </View>
            </View>
          ))
        ) : (
          <Text style="featured-empty-hint">No publishers of the week yet.</Text>
        )}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    <Style id="spotlight-entry" gap={8} marginBottom={16} />
    <Style id="spotlight-cover" width="100%" height={280} />
    <Style
      id="spotlight-date"
      fontSize={10}
      fontWeight="600"
      letterSpacing={1.5}
      color="#a22c29"
    />
    <Style id="spotlight-title" fontFamily="Fraunces-Medium" fontSize={20} />
    <Style
      id="spotlight-btn"
      borderWidth={1}
      borderColor="#191613"
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
    />
    <Style id="spotlight-btn-label" fontSize={14} fontWeight="600" color="#191613" />
  </>
);
