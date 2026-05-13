import { FC, PropsWithChildren } from "hono/jsx";
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
import { raw } from "hono/html";
import { xmlText } from "../../lib/hxml";
import HyperviewDock, {
  dockShellStyles,
  type HyperviewDockActive,
} from "../../features/hyperview/components/HyperviewDock";

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
}) => {
  const docked = Boolean(showDock && baseUrl);

  return (
    <Doc xmlns="https://hyperview.org/hyperview">
      <Screen>
        <Styles>
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
            paddingLeft={20}
            paddingRight={20}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            borderBottomWidth={0}
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
          <Style
            id="tab-label"
            fontSize={13}
            fontWeight="600"
            color="#666666"
          />
          <Style id="tab-content" flex={1} />
          {docked ? dockShellStyles() : null}
          {extraStyles}
        </Styles>
        <Body style="body" scroll={docked ? "false" : "true"}>
          {headerVariant === "featured"
            ? raw(`<view style="featured-header">
          <text style="featured-header-logo">${xmlText("photobookers")}</text>
        </view>`)
            : raw(`<view style="custom-header">
          <behavior trigger="press" action="back" />
          ${showBackButton ? `<text style="back-btn">←</text>` : ""}
          <text style="header-title">${xmlText(title)}</text>
        </view>`)}
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
