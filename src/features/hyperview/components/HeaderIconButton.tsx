import { Behavior, Image, Style, View } from "../../../lib/hxml-comps";

const SEARCH_ACTIVE_COLOR = "#0099cc";

const searchIconToggleIds = (searchBarTarget: string) => ({
  idle: `${searchBarTarget}-icon-idle`,
  active: `${searchBarTarget}-icon-active`,
});

type Props = {
  href?: string;
  icon: string;
  action?: "push" | "replace" | "toggle";
  target?: string;
  scrollToTopTarget?: string;
};

const HeaderIconButton = ({
  href,
  icon,
  action = "push",
  target,
  scrollToTopTarget,
}: Props) => {
  const isSearchToggle = action === "toggle" && target;
  const iconIds = isSearchToggle ? searchIconToggleIds(target) : null;

  return (
    <View style="featured-header-btn-wrap">
      {scrollToTopTarget ? (
        <Behavior action="scroll-to-top" target={scrollToTopTarget} />
      ) : null}
      {isSearchToggle && iconIds ? (
        <>
          <Behavior action="toggle" target={target} />
          <Behavior action="toggle" target={iconIds.idle} />
          <Behavior action="toggle" target={iconIds.active} />
        </>
      ) : (
        <Behavior
          action={action}
          {...(href ? { href } : {})}
          {...(target ? { target } : {})}
        />
      )}
      {iconIds ? (
        <>
          <View id={iconIds.idle} style="header-search-icon-layer">
            <Image
              source={icon}
              style="featured-header-icon"
              resize-mode="contain"
            />
          </View>
          <View id={iconIds.active} style="header-search-icon-layer" hide="true">
            <Image
              source={icon}
              style="featured-header-icon"
              tintColor={SEARCH_ACTIVE_COLOR}
              resize-mode="contain"
            />
          </View>
        </>
      ) : (
        <Image source={icon} style="featured-header-icon" resize-mode="contain" />
      )}
    </View>
  );
};

export default HeaderIconButton;

export const headerIconButtonStyles = () => (
  <>
    <Style
      id="featured-header-btn-wrap"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <modifier />
    </Style>
    <Style id="featured-header-icon" width={22} height={22} />
    <Style id="header-search-icon-layer" width={22} height={22} />
  </>
);
