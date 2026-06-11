import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import AboutContent, {
  aboutContentStyles,
} from "../../../features/hyperview/components/AboutContent";
import { settingsTabStyles } from "../../../features/hyperview/components/SettingsTabs";
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
      dockActive="about"
      extraStyles={pageStyles()}
    >
      <AboutContent />
      <View style="settings-links">
        <View style="settings-link-btn">
          <Behavior href={`${baseUrl}/hyperview/terms`} />
          <Text style="settings-link-label">Terms</Text>
        </View>
        <View style="settings-link-btn">
          <Behavior href={`${baseUrl}/hyperview/privacy`} />
          <Text style="settings-link-label">Privacy</Text>
        </View>
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
    <Style
      id="settings-links"
      flexDirection="column"
      paddingLeft={16}
      paddingRight={16}
      paddingTop={8}
      paddingBottom={16}
    />
    <Style
      id="settings-link-btn"
      backgroundColor="#fbfaf7"
      borderWidth={1}
      borderColor="#a39d90"
      borderRadius={0}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      marginBottom={12}
    />
    <Style
      id="settings-link-label"
      color="#191613"
      fontWeight="600"
      fontSize={16}
    />
    {aboutContentStyles()}
    {settingsTabStyles()}
    {legalTextStyles()}
  </>
);
