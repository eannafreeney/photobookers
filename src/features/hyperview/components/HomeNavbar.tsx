import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { AuthUser } from "../../../../types";
import { xmlText } from "../../../lib/hxml";
import HeaderIconButton, { headerIconButtonStyles } from "./HeaderIconButton";

type Props = {
  baseUrl?: string;
  user?: AuthUser | null;
};

const HomeNavbar = ({ baseUrl, user }: Props) => {
  return (
    <View
      xmlns="https://hyperview.org/hyperview"
      style="featured-header-safe"
      safe-area="true"
    >
      <View style="featured-header">
        <View style="featured-header-inner">
          <View style="featured-header-center">
            <Text style="featured-header-logo">{xmlText("photobookers")}</Text>
          </View>
          <View style="featured-header-side-left">
            {baseUrl && !user ? (
              <HeaderIconButton
                href={`${baseUrl}/hyperview/login`}
                icon={`${baseUrl}/icons/header/login.png`}
              />
            ) : baseUrl ? (
              <HeaderIconButton
                href={`${baseUrl}/hyperview/logout`}
                icon={`${baseUrl}/icons/header/logout.png`}
              />
            ) : null}
          </View>
          <View style="featured-header-side-right">
            {baseUrl ? (
              <HeaderIconButton
                href={`${baseUrl}/hyperview/search`}
                icon={`${baseUrl}/icons/header/search.png`}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeNavbar;

export const homeNavbarStyles = () => (
  <>
    <Style
      id="featured-header-safe"
      width="100%"
      backgroundColor="#fbfaf7"
      borderBottomWidth={2}
      borderBottomColor="#191613"
    />
    <Style
      id="featured-header"
      width="100%"
      paddingBottom={12}
      paddingLeft={12}
      paddingRight={12}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="featured-header-inner"
      position="relative"
      flex={1}
      width="100%"
      minHeight={44}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      paddingLeft={72}
      paddingRight={72}
    />
    <Style
      id="featured-header-side-left"
      position="absolute"
      left={0}
      top={0}
      bottom={0}
      zIndex={2}
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
    />
    <Style
      id="featured-header-side-right"
      position="absolute"
      right={0}
      top={0}
      bottom={0}
      zIndex={2}
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-end"
    />
    <Style
      id="featured-header-center"
      flexShrink={0}
      zIndex={1}
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="featured-header-logo"
      fontFamily="Caveat-SemiBold"
      fontSize={28}
      fontWeight={400}
      color="#191613"
      letterSpacing={0.5}
    />
    {headerIconButtonStyles()}
  </>
);
