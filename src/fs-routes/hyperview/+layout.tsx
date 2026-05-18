import { FC, PropsWithChildren } from "hono/jsx";
import {
  Doc,
  Screen,
  Body,
  Styles,
  Style,
  ScrollView,
  View,
  Text,
  Behavior,
} from "../../lib/hxml-comps";
import { Child } from "hono/jsx";
import { raw } from "hono/html";
import { xmlText } from "../../lib/hxml";
import HyperviewDock, {
  dockShellStyles,
  type HyperviewDockActive,
} from "../../features/hyperview/components/HyperviewDock";
import { AuthUser } from "../../types";

export const AppLayout: FC<
  PropsWithChildren<{
    title: string;
    extraStyles?: Child;
    showBackButton?: boolean;
    /** Featured home: large blue bar with wordmark instead of default title bar */
    headerVariant?: "default" | "featured";
    /** Bottom dock: static layout below a flex-1 scroll region (no absolute positioning). */
    showDock?: boolean;
    baseUrl?: string;
    dockActive?: HyperviewDockActive;
    user?: AuthUser;
  }>
> = ({
  title,
  children,
  extraStyles,
  showBackButton = true,
  headerVariant = "default",
  showDock = false,
  baseUrl,
  dockActive,
  user,
}) => {
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
            <View style="featured-header">
              <View style="featured-header-side">
                {baseUrl && !user ? (
                  <View style="featured-header-btn-wrap">
                    <Behavior
                      trigger="press"
                      action="push"
                      href={`${baseUrl}/hyperview/login`}
                    />
                    <Text style="featured-header-side-btn">Log in</Text>
                  </View>
                ) : (
                  <View style="featured-header-btn-wrap">
                    <Behavior
                      trigger="press"
                      action="push"
                      href={`${baseUrl}/hyperview/logout`}
                    />
                    <Text style="featured-header-side-btn">Log out</Text>
                  </View>
                )}
              </View>
              <View style="featured-header-center">
                <Text style="featured-header-logo">photobookers</Text>
              </View>
              <View style="featured-header-side featured-header-side-right">
                {baseUrl ? (
                  <View style="featured-header-btn-wrap">
                    <Behavior
                      trigger="press"
                      action="push"
                      href={`${baseUrl}/hyperview/search`}
                    />
                    <Text style="featured-header-side-btn">🔍</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style="custom-header">
              <Behavior trigger="press" action="back" />
              {showBackButton ? <Text style="back-btn">←</Text> : null}
              <Text style="header-title">{xmlText(title)}</Text>
            </View>
          )}
          {docked && baseUrl ? (
            <View style="shell-column">
              <ScrollView style="shell-scroll">{children}</ScrollView>
              <HyperviewDock baseUrl={baseUrl} active={dockActive} />
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

    <Style id="content" flex={1} />
    <Style
      id="custom-header"
      backgroundColor="#ffffff"
      paddingTop={52}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
      flexDirection="row"
      alignItems="center"
    />
    <Style
      id="featured-header"
      backgroundColor="#0099cc"
      paddingTop={56}
      paddingBottom={20}
      paddingLeft={12}
      paddingRight={12}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={0}
    />
    <Style
      id="featured-header-side"
      flex={1}
      flexDirection="row"
      alignItems="center"
      fontSize={8}
    >
      <modifier />
    </Style>
    <Style id="featured-header-side-right" justifyContent="flex-end" />
    <Style
      id="featured-header-center"
      flex={2}
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="featured-header-logo"
      fontSize={20}
      fontWeight="600"
      color="#ffffff"
      letterSpacing={1}
      paddingTop={8}
    />
    <Style
      id="featured-header-btn-wrap"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <modifier />
    </Style>
    <Style
      id="featured-header-btn-wrap"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    />
    <Style
      id="featured-header-side-btn"
      fontSize={14}
      fontWeight="600"
      color="#ffffff"
    />
    <Style
      id="featured-header-logo"
      fontSize={20}
      fontWeight="600"
      color="#ffffff"
      letterSpacing={1}
      paddingTop={8}
    />
    <Style
      id="header-title"
      fontSize={18}
      fontWeight="700"
      color="#111111"
      flex={1}
    />
    <Style id="back-btn" fontSize={16} color="#3366cc" marginRight={12} />
    <Style
      id="tab-bar"
      flexDirection="row"
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
      marginBottom={12}
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
  </>
);
