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
        <Text style="section-header-view-all-label">View all</Text>
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
      alignItems="center"
      justifyContent="space-between"
      marginBottom={12}
    />
    <Style
      id="section-header-title"
      fontSize={18}
      fontWeight="700"
      color="#111111"
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
      fontSize={13}
      color="#3366cc"
      fontWeight="600"
    />
  </>
);
