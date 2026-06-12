import { Behavior, View, Text, Style } from "../../../lib/hxml-comps";
import { hyperviewTagBooksUrl } from "../../../lib/tags";

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
            <Behavior href={hyperviewTagBooksUrl(baseUrl, tag)} />
            <Text style="discover-tag-label">{tag.toUpperCase()}</Text>
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
      borderColor="#191613"
      borderRadius={999}
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={14}
      paddingRight={14}
      backgroundColor="#fbfaf7"
      marginRight={8}
      marginBottom={8}
    />
    <Style
      id="discover-tag-label"
      fontSize={11}
      fontWeight="600"
      letterSpacing={1}
      color="#191613"
    />
  </>
);
