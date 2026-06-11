import { FC } from "hono/jsx";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  label: string;
  href: string;
  isDisabled?: boolean;
};

const PrimaryButtonLink: FC<Props> = ({ label, href, isDisabled = false }) => (
  <View
    style={isDisabled ? "primary-button-link-disabled" : "primary-button-link"}
  >
    <Text
      style={
        isDisabled
          ? "primary-button-link-label-disabled"
          : "primary-button-link-label"
      }
    >
      {label}
    </Text>
    {!isDisabled ? <Behavior href={href} /> : null}
  </View>
);

export default PrimaryButtonLink;

export const primaryButtonLinkStyles = () => (
  <>
    <Style
      id="primary-button-link"
      flex={1}
      backgroundColor="#191613"
      borderRadius={0}
      padding={12}
      alignItems="center"
    />
    <Style
      id="primary-button-link-label"
      fontSize={14}
      fontWeight="600"
      color="#fbfaf7"
    />
    <Style
      id="primary-button-link-disabled"
      flex={1}
      borderWidth={1}
      borderColor="#e4e0d5"
      borderRadius={0}
      padding={12}
      alignItems="center"
      backgroundColor="#f2efe8"
    />
    <Style
      id="primary-button-link-label-disabled"
      fontSize={14}
      fontWeight="600"
      color="#a39d90"
    />
  </>
);
