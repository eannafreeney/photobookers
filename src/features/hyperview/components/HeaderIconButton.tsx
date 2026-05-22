import { Behavior, Image, Style, View } from "../../../lib/hxml-comps";

type Props = {
  href?: string;
  icon: string;
  action?: "push" | "replace" | "toggle";
  target?: string;
};

const HeaderIconButton = ({ href, icon, action = "push", target }: Props) => (
  <View style="featured-header-btn-wrap">
    <Behavior
      action={action}
      {...(href ? { href } : {})}
      {...(target ? { target } : {})}
    />
    <Image source={icon} style="featured-header-icon" resize-mode="contain" />
  </View>
);

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
  </>
);
