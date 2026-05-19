import { PropsWithChildren } from "hono/jsx";
import {
  Doc,
  Screen,
  Body,
  Styles,
  Style,
  ScrollView,
  View,
} from "../../lib/hxml-comps";
import { Child } from "hono/jsx";
import {
  dockShellStyles,
  type HyperviewDockActive,
} from "../../features/hyperview/components/HyperviewDock";
import { AuthUser } from "../../../types";
import HomeNavbar, {
  homeNavbarStyles,
} from "../../features/hyperview/components/HomeNavbar";
import CustomHeader, {
  customHeaderStyles,
} from "../../features/hyperview/components/CustomHeader";

type Props = PropsWithChildren<{
  title: string;
  artist?: string;
  extraStyles?: Child;
  showBackButton?: boolean;
  /** Featured home: large blue bar with wordmark instead of default title bar */
  headerVariant?: "default" | "featured";
  /** Bottom dock: static layout below a flex-1 scroll region (no absolute positioning). */
  showDock?: boolean;
  baseUrl?: string;
  dockActive?: HyperviewDockActive;
  user?: AuthUser;
}>;

export const AppLayout = ({
  title,
  children,
  extraStyles,
  showBackButton = true,
  headerVariant = "default",
  showDock = false,
  baseUrl,
  dockActive,
  artist,
  user,
}: Props) => {
  const docked = Boolean(showDock && baseUrl);

  return (
    <Doc xmlns="https://hyperview.org/hyperview">
      <Screen>
        <Styles>
          {baseStyles()}
          {docked ? dockShellStyles() : null}
          {extraStyles}
        </Styles>
        <Body style="body" scroll={docked ? "false" : "true"}>
          {headerVariant === "featured" ? (
            <HomeNavbar baseUrl={baseUrl} user={user} />
          ) : (
            <CustomHeader
              title={title}
              artist={artist}
              showBackButton={showBackButton}
            />
          )}
          {docked && baseUrl ? (
            <View style="shell-column">
              <ScrollView style="shell-scroll">{children}</ScrollView>
              {/* <HyperviewDock baseUrl={baseUrl} active={dockActive} /> */}
            </View>
          ) : (
            children
          )}
        </Body>
      </Screen>
    </Doc>
  );
};

const baseStyles = () => (
  <>
    <Style
      id="body"
      flex={1}
      flexDirection="column"
      backgroundColor="#f8f7f5"
    />
    <Style id="list" flex={1} />
    <Style id="page-content" margin={16} />
    <Style id="content" flex={1} />
    <Style
      id="tab-bar"
      flexDirection="row"
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
      alignItems="center"
      justifyContent="center"
      gap={12}
    />
    <Style
      id="tab-btn"
      flex={1}
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
    />
    <Style id="tab-label" fontSize={13} fontWeight="600" color="#666666" />
    <Style id="tab-content" flex={1} />
    <Style
      id="header-search-wrap"
      paddingLeft={8}
      paddingRight={4}
      paddingTop={4}
      paddingBottom={4}
      backgroundColor="#f8f7f5"
    />
    <Style id="header-search-btn" fontSize={18} color="#3366cc" />
    {homeNavbarStyles()}
    {customHeaderStyles()}
  </>
);
