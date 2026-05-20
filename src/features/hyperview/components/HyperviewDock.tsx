import { FC } from "hono/jsx";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

export type HyperviewDockActive = "home" | "search" | "books" | "settings";

type HyperviewDockProps = {
  baseUrl: string;
  active?: HyperviewDockActive;
};

const item = (isActive: boolean) =>
  isActive ? "dock-label-active" : "dock-label";

const HyperviewDock: FC<HyperviewDockProps> = ({ baseUrl, active }) => {
  return (
    <View style="dock">
      <View style="dock-item">
        <Behavior
          trigger="press"
          action="push"
          href={`${baseUrl}/hyperview/featured`}
        />
        <Text style={item(active === "home")}>Home</Text>
      </View>
      <View style="dock-item">
        <Behavior
          trigger="press"
          action="push"
          href={`${baseUrl}/hyperview/search`}
        />
        <Text style={item(active === "search")}>Search</Text>
      </View>
      <View style="dock-item">
        <Behavior
          trigger="press"
          action="push"
          href={`${baseUrl}/hyperview/books`}
        />
        <Text style={item(active === "books")}>Books</Text>
      </View>
      <View style="dock-item">
        <Behavior
          trigger="press"
          action="push"
          href={`${baseUrl}/hyperview/settings`}
        />
        <Text style={item(active === "settings")}>Settings</Text>
      </View>
    </View>
  );
};

export default HyperviewDock;

/** Column shell: scrollable main (`shell-scroll`) then dock (static, end of column). */
export const dockShellStyles = () => (
  <>
    <Style
      id="shell-column"
      flex={1}
      flexDirection="column"
      backgroundColor="#f8f7f5"
    />
    <Style id="shell-scroll" flex={1} />
    <Style
      id="dock"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-around"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
      borderTopWidth={1}
      borderTopColor="#e5e5e5"
      backgroundColor="#ffffff"
      height={48}
    />
    <Style id="dock-item" flex={1} alignItems="center" paddingTop={4} />
    <Style id="dock-label" fontSize={11} fontWeight="600" color="#999999" />
    <Style
      id="dock-label-active"
      fontSize={11}
      fontWeight="700"
      color="#111111"
    />
  </>
);
