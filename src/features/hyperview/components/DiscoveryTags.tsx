import { xmlText } from "../../../lib/hxml-components";
import { Behavior, View, Text, Style } from "../../../lib/hxml-comps";
import { capitalize } from "../../../utils";

type Props = {
  baseUrl: string;
  tags: string[];
};

const DiscoveryTags = ({ baseUrl, tags }: Props) => {
  return (
    <View style="discover-tags-section">
      <View style="discover-tags-wrap">
        {tags.map((tag) => (
          <View key={tag} style="discover-tag-pill">
            <Behavior
              href={`${baseUrl}/hyperview/tags/${encodeURIComponent(tag.toLowerCase())}`}
            />
            <Text style="discover-tag-label">{capitalize(tag)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DiscoveryTags;

export const discoveryTagStyles = () => (
  <>
    <Style
      id="discover-tags-section"
      flexDirection="column"
      marginTop={8}
      marginBottom={8}
    />
    <Style
      id="discover-tags-wrap"
      flexDirection="row"
      flexWrap="wrap"
      alignItems="flex-start"
    />
    <Style
      id="discover-tag-pill"
      borderWidth={1}
      borderColor="#e5e5e5"
      borderRadius={999}
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={14}
      paddingRight={14}
      backgroundColor="#ffffff"
      marginRight={8}
      marginBottom={8}
    />
    <Style
      id="discover-tag-label"
      fontSize={14}
      fontWeight="500"
      color="#111111"
    />
  </>
);
