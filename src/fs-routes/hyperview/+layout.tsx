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
import HyperviewDock, {
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
  publisher?: string;
  extraStyles?: Child;
  showBackButton?: boolean;
  /** Featured home: large blue bar with wordmark instead of default title bar */
  headerVariant?: "default" | "featured";
  /** Bottom dock: static layout below a flex-1 scroll region (no absolute positioning). */
  showDock?: boolean;
  /** Keep CustomHeader fixed; scroll page content in an inner region (non-docked screens). */
  fixedHeader?: boolean;
  baseUrl?: string;
  dockActive?: HyperviewDockActive;
  user?: AuthUser | null;
  isVerified?: boolean;
  nativeList?: boolean;
  /** When set, pull-to-refresh reloads this URL on docked screens (shell scroll). */
  dockScrollRefreshHref?: string;
  coverUrl?: string | null;
  isSearch?: boolean;
  searchToggleTarget?: string;
  /** Scroll container id for `scroll-to-top` when opening header search. */
  searchScrollToTopTarget?: string;
  showClaimButton?: boolean;
  claimHref?: string;
}>;

export const SHELL_SCROLL_ID = "shell-scroll";

export const AppLayout = ({
  title,
  coverUrl,
  children,
  extraStyles,
  isVerified = false,
  showBackButton = true,
  headerVariant = "default",
  showDock = false,
  fixedHeader = false,
  baseUrl,
  dockActive,
  artist,
  publisher,
  user,
  nativeList = false,
  dockScrollRefreshHref,
  isSearch,
  searchToggleTarget,
  searchScrollToTopTarget,
  showClaimButton = false,
  claimHref,
}: Props) => {
  const docked = Boolean(showDock && baseUrl);
  const shellScroll = docked || fixedHeader;

  return (
    <Doc xmlns="https://hyperview.org/hyperview">
      <Screen>
        <Styles>
          {baseStyles()}
          {shellScroll ? dockShellStyles() : null}
          {extraStyles}
        </Styles>
        <Body style="body" scroll={shellScroll ? "false" : "true"}>
          {headerVariant === "featured" ? (
            <HomeNavbar baseUrl={baseUrl} user={user} />
          ) : (
            <CustomHeader
              title={title}
              artist={artist}
              publisher={publisher}
              showBackButton={showBackButton}
              isVerified={isVerified}
              coverUrl={coverUrl}
              isSearch={isSearch}
              baseUrl={baseUrl}
              searchToggleTarget={searchToggleTarget}
              searchScrollToTopTarget={searchScrollToTopTarget}
              showClaimButton={showClaimButton}
              claimHref={claimHref}
            />
          )}
          {docked && baseUrl ? (
            nativeList ? (
              <View style="shell-column">
                {children}
                <HyperviewDock baseUrl={baseUrl} active={dockActive} />
              </View>
            ) : (
              <View style="shell-column">
                <ScrollView
                  id={SHELL_SCROLL_ID}
                  style="shell-scroll"
                  {...(dockScrollRefreshHref
                    ? {
                        trigger: "refresh",
                        action: "reload",
                        href: dockScrollRefreshHref,
                      }
                    : {})}
                >
                  {children}
                </ScrollView>
                <HyperviewDock baseUrl={baseUrl} active={dockActive} />
              </View>
            )
          ) : fixedHeader ? (
            <View style="shell-column">
              <ScrollView id={SHELL_SCROLL_ID} style="shell-scroll">
                {children}
              </ScrollView>
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
      backgroundColor="#fbfaf7"
    />
    <Style id="list" flex={1} />
    <Style id="page-content" margin={16} />
    <Style
      id="page-content-no-margin-top"
      marginRight={16}
      marginLeft={16}
      marginBottom={16}
    />
    <Style id="content" flex={1} />
    <Style
      id="tab-bar"
      flexDirection="row"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
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
      fontSize={11}
      fontWeight="600"
      letterSpacing={1.5}
      color="#45413a"
    />
    <Style id="tab-content" flex={1} />
    <Style
      id="header-search-wrap"
      paddingLeft={8}
      paddingRight={4}
      paddingTop={4}
      paddingBottom={4}
      backgroundColor="#fbfaf7"
    />
    <Style id="header-search-btn" fontSize={18} color="#a22c29" />
    {homeNavbarStyles()}
    {customHeaderStyles()}
  </>
);
