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
          <Text style="featured-header-logo">{xmlText("photobookers")}</Text>
        </View>
        <View style="featured-header-side">
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
      backgroundColor="#0099cc"
      paddingTop={56}
      paddingBottom={20}
      paddingLeft={12}
      paddingRight={12}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      borderBottomWidth={0}
    />
    <Style
      id="featured-header-inner"
      flexDirection="row"
      alignItems="end"
      justifyContent="space-between"
      flexWrap="nowrap"
      gap={16}
    />
    <Style
      id="featured-header-side"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="featured-header-center"
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="featured-header-logo"
      fontFamily="Caveat, ui-sans-serif, system-ui, sans-serif"
      fontSize={24}
      fontWeight="500"
      color="#ffffff"
      letterSpacing={0.5}
      paddingTop={4}
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
      fontFamily="Instrument Sans, ui-sans-serif, system-ui, sans-serif"
      fontSize={14}
      fontWeight="500"
      color="#ffffff"
    />
  </>
);
