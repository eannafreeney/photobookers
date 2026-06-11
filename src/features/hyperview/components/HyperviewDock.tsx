import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";

export type HyperviewDockActive =
  | "home"
  | "books"
  | "creators"
  | "favorites"
  | "about";

type HyperviewDockProps = {
  baseUrl: string;
  active?: HyperviewDockActive;
};

type DockItem = {
  id: HyperviewDockActive;
  label: string;
  path: string;
  icon: string;
};

const DOCK_ITEMS: DockItem[] = [
  { id: "home", label: "Home", path: "featured", icon: "home" },
  { id: "creators", label: "Creators", path: "creators", icon: "creators" },
  { id: "books", label: "Books", path: "books", icon: "books" },
  // { id: "search", label: "search", path: "search", icon: "search" },
  { id: "favorites", label: "Favorites", path: "favorites", icon: "favorites" },
  { id: "about", label: "About", path: "about", icon: "about" },
];

const labelStyle = (isActive: boolean) =>
  isActive ? "dock-label-active" : "dock-label";

const iconStyle = (isActive: boolean) =>
  isActive ? "dock-icon-active" : "dock-icon";

const HyperviewDock: FC<HyperviewDockProps> = ({ baseUrl, active }) => {
  return (
    <View style="dock">
      {DOCK_ITEMS.map(({ id, label, path, icon }) => {
        const isActive = active === id;
        return (
          <View style="dock-item">
            <Behavior href={`${baseUrl}/hyperview/${path}`} />
            <Image
              source={`${baseUrl}/icons/dock/${icon}.png`}
              style={iconStyle(isActive)}
              resize-mode="contain"
            />
            <Text style={labelStyle(isActive)}>{label.toUpperCase()}</Text>
          </View>
        );
      })}
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
      backgroundColor="#fbfaf7"
    />
    <Style id="shell-scroll" flex={1} />
    <Style
      id="dock"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-around"
      paddingTop={12}
      paddingBottom={20}
      marginBottom={24}
      paddingLeft={8}
      paddingRight={8}
      borderTopWidth={2}
      borderTopColor="#191613"
      backgroundColor="#fbfaf7"
      height={56}
    />
    <Style id="dock-item" flex={1} alignItems="center" paddingTop={2} />
    <Style
      id="dock-icon"
      width={22}
      height={22}
      tintColor="#a39d90"
      marginBottom={2}
    />
    <Style
      id="dock-icon-active"
      width={22}
      height={22}
      marginBottom={2}
      tintColor="#a22c29"
    />
    <Style
      id="dock-label"
      fontSize={9}
      fontWeight="600"
      letterSpacing={1}
      color="#a39d90"
    />
    <Style
      id="dock-label-active"
      fontSize={9}
      fontWeight="700"
      letterSpacing={1}
      color="#a22c29"
    />
  </>
);
