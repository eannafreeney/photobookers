import { Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  sections: readonly string[];
};

const LegalText = ({ sections }: Props) => (
  <View style="legal-text">
    {sections.map((section, index) => (
      <Text key={index} style="legal-section">
        {section}
      </Text>
    ))}
  </View>
);

export default LegalText;

export const legalTextStyles = () => (
  <>
    <Style
      id="legal-text"
      flexDirection="column"
      paddingTop={8}
      paddingBottom={24}
    />
    <Style
      id="legal-section"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={16}
    />
  </>
);
