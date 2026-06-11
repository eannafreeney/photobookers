// src/features/hyperview/components/SectionHeader.tsx
import { FC } from "hono/jsx";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  title: string;
  viewAllHref?: string;
};

const SectionHeader: FC<Props> = ({ title, viewAllHref }) => (
  <View style="section-header">
    <Text style="section-header-title">{title}</Text>
    {viewAllHref && (
      <View style="section-header-view-all">
        <Text style="section-header-view-all-label">VIEW ALL →</Text>
        <Behavior href={viewAllHref} />
      </View>
    )}
  </View>
);

export default SectionHeader;

export const sectionHeaderStyles = () => (
  <>
    <Style
      id="section-header"
      flexDirection="row"
      alignItems="flex-end"
      justifyContent="space-between"
      marginBottom={12}
      marginTop={8}
      paddingTop={10}
      borderTopWidth={2}
      borderTopColor="#191613"
    />
    <Style
      id="section-header-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={20}
      color="#191613"
    />
    <Style
      id="section-header-view-all"
      paddingTop={4}
      paddingBottom={4}
      paddingLeft={8}
      paddingRight={8}
    />
    <Style
      id="section-header-view-all-label"
      fontSize={11}
      letterSpacing={1}
      color="#a22c29"
      fontWeight="600"
    />
  </>
);
