import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Behavior, Spinner, Style, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import AboutContent, {
  aboutContentStyles,
} from "../../../features/hyperview/components/AboutContent";
import SettingsTabs, {
  settingsTabStyles,
} from "../../../features/hyperview/components/SettingsTabs";
import { legalTextStyles } from "../../../features/hyperview/components/LegalText";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  return hv(
    <AppLayout
      title="About"
      user={user}
      showDock
      baseUrl={baseUrl}
      dockActive="settings"
      extraStyles={pageStyles()}
    >
      <AboutContent />
      <SettingsTabs baseUrl={baseUrl} activeTab="terms" />
      <View id="tab-spinner" style="settings-tab-spinner" hide="true">
        <Spinner />
      </View>
      <View id="tab-area" style="settings-tab-area">
        <Behavior
          trigger="load"
          verb="get"
          action="replace-inner"
          target="tab-area"
          href={`${baseUrl}/hyperview/settings/tab/terms`}
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="settings-tab-area" margin={16} flex={1} />
    <Style id="tab-fragment" flex={1} />
    <Style
      id="settings-tab-spinner"
      flex={1}
      minHeight={240}
      alignItems="center"
      justifyContent="center"
      paddingTop={48}
    />
    {aboutContentStyles()}
    {settingsTabStyles()}
    {legalTextStyles()}
  </>
);
