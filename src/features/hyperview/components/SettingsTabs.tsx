import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text,
} from "../../../lib/hxml-comps";

export type SettingsTab = "terms" | "privacy";

type SettingsTabsProps = {
  baseUrl: string;
  activeTab?: SettingsTab;
};

const tabLoadBehavior = (baseUrl: string, path: SettingsTab) => ({
  trigger: "select" as const,
  verb: "get" as const,
  href: `${baseUrl}/hyperview/settings/tab/${path}`,
  action: "replace-inner" as const,
  target: "tab-area",
  "hide-during-load": "tab-area",
  "show-during-load": "tab-spinner",
});

const SettingsTabs = ({ baseUrl, activeTab = "terms" }: SettingsTabsProps) => (
  <SelectSingle style="tab-bar" name="settings-tab">
    <Option
      value="terms"
      style="tab-btn"
      selected={activeTab === "terms" ? "true" : undefined}
    >
      <Behavior {...tabLoadBehavior(baseUrl, "terms")} />
      <Text style="tab-label">TERMS</Text>
    </Option>
    <Option
      value="privacy"
      style="tab-btn"
      selected={activeTab === "privacy" ? "true" : undefined}
    >
      <Behavior {...tabLoadBehavior(baseUrl, "privacy")} />
      <Text style="tab-label">PRIVACY</Text>
    </Option>
  </SelectSingle>
);

export default SettingsTabs;

export const settingsTabStyles = () => (
  <>
    <Style
      id="tab-btn"
      flex={1}
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
    >
      <Modifier selected="true">
        <Style borderBottomWidth={2} borderBottomColor="#a22c29" />
      </Modifier>
    </Style>
    <Style
      id="tab-label"
      fontSize={11}
      fontWeight="600"
      letterSpacing={1.5}
      color="#a39d90"
    >
      <Modifier selected="true">
        <Style color="#a22c29" />
      </Modifier>
    </Style>
  </>
);
