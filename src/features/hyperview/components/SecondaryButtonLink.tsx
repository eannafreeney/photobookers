import { FC } from "hono/jsx";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  label: string;
  href: string;
  isDisabled?: boolean;
};

const SecondaryButtonLink: FC<Props> = ({
  label,
  href,
  isDisabled = false,
}) => (
  <View
    style={
      isDisabled ? "secondary-button-link-disabled" : "secondary-button-link"
    }
  >
    <Text
      style={
        isDisabled
          ? "secondary-button-link-label-disabled"
          : "secondary-button-link-label"
      }
    >
      {label}
    </Text>
    {!isDisabled ? <Behavior href={href} /> : null}
  </View>
);

export default SecondaryButtonLink;

export const secondaryButtonLinkStyles = () => (
  <>
    <Style
      id="secondary-button-link"
      borderWidth={1}
      borderColor="#111111"
      borderRadius={8}
      padding={12}
      alignItems="center"
    />
    <Style
      id="secondary-button-link-label"
      fontSize={14}
      fontWeight="600"
      color="#111111"
    />
    <Style
      id="secondary-button-link-disabled"
      flex={1}
      borderWidth={1}
      borderColor="#e5e5e5"
      borderRadius={8}
      padding={12}
      alignItems="center"
      backgroundColor="#f5f5f5"
    />
    <Style
      id="secondary-button-link-label-disabled"
      fontSize={14}
      fontWeight="600"
      color="#999999"
    />
  </>
);
