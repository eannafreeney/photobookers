import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Behavior, Spinner, Style, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import FairsTabs, {
  FAIRS_TAB_TARGET_ID,
  fairsTabStyles,
} from "../../../features/hyperview/components/FairsTabs";
import { fairsListStyles } from "../../../features/hyperview/components/FairsList";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";

const DEFAULT_FAIRS_TAB = "current";

const defaultTabHref = (baseUrl: string) =>
  `${baseUrl}/hyperview/fairs/tab/${DEFAULT_FAIRS_TAB}`;

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  if (!isFeatureEnabledForUser("fairs", user)) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Not found" />,
      404,
    );
  }

  return hv(
    <AppLayout
      showDock
      title="Book Fairs"
      user={user}
      baseUrl={baseUrl}
      dockActive="home"
      extraStyles={pageStyles()}
      dockScrollRefreshHref={`${baseUrl}/hyperview/fairs`}
    >
      <View style="page-content">
        <FairsTabs baseUrl={baseUrl} activeTab={DEFAULT_FAIRS_TAB} />
        <View id="fairs-tab-spinner" style="fairs-tab-spinner" hide="true">
          <Spinner />
        </View>
        <View id={FAIRS_TAB_TARGET_ID} style="page-content">
          <Behavior
            trigger="load"
            verb="get"
            action="replace-inner"
            target={FAIRS_TAB_TARGET_ID}
            href={defaultTabHref(baseUrl)}
            hide-during-load={FAIRS_TAB_TARGET_ID}
            show-during-load="fairs-tab-spinner"
          />
        </View>
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="tab-fragment" flex={1} />
    <Style
      id="fairs-tab-spinner"
      flex={1}
      minHeight={240}
      alignItems="center"
      justifyContent="center"
      paddingTop={48}
    />
    {fairsTabStyles()}
    {fairsListStyles()}
    {signInEmptyHintStyles()}
  </>
);
