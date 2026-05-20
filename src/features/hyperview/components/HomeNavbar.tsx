import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";
import { AuthUser } from "../../../../types";
import { xmlText } from "../../../lib/hxml";

type Props = {
  baseUrl?: string;
  user?: AuthUser | null;
};

const HomeNavbar = ({ baseUrl, user }: Props) => {
  return (
    <View xmlns="https://hyperview.org/hyperview" style="featured-header">
      <View style="featured-header-inner">
        <View style="featured-header-side-left">
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
          <Text style="featured-header-logo">{xmlText("photobookers")}</Text>
        </View>
        <View style="featured-header-side-right">
          {baseUrl ? (
            <View style="featured-header-btn-wrap">
              <Behavior
                trigger="press"
                action="push"
                href={`${baseUrl}/hyperview/search`}
              />
              <Text style="featured-header-side-btn">Search</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default HomeNavbar;

export const homeNavbarStyles = () => (
  <>
    <Style
      id="featured-header"
      width="100%"
      backgroundColor="#0099cc"
      paddingTop={32}
      paddingBottom={12}
      paddingLeft={12}
      paddingRight={12}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      borderBottomWidth={0}
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
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-end"
    />
    <Style
      id="featured-header-center"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="featured-header-logo"
      fontFamily="Caveat-Medium"
      fontSize={24}
      fontWeight={400}
      color="#ffffff"
      letterSpacing={0.5}
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
      id="featured-header-side-btn"
      fontSize={12}
      fontWeight="500"
      color="#ffffff"
    />
  </>
);
