import { FC } from "hono/jsx";
import { Behavior, Style, Text, View } from "../../../../lib/hxml-comps";

function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { preview: text.trim(), needsToggle: false };
  }
  return {
    preview: `${words.slice(0, maxWords).join(" ")}…`,
    needsToggle: true,
  };
}

type Props = {
  bio: string;
  id: string;
  textStyle?: string;
  maxWords?: number;
};

const ExpandableBio = ({
  bio,
  id,
  textStyle = "spotlight-body-text",
  maxWords = 40,
}: Props) => {
  const collapsedId = `spotlight-bio-collapsed-${id}`;
  const expandedId = `spotlight-bio-expanded-${id}`;
  const { preview, needsToggle } = truncateWords(bio, maxWords);

  if (!needsToggle) {
    return <Text style={textStyle}>{bio}</Text>;
  }

  return (
    <View>
      <View id={collapsedId}>
        <Text style={textStyle}>{preview}</Text>
        <View style="spotlight-bio-toggle">
          <Text style="spotlight-bio-toggle-label">See more</Text>
          <Behavior action="toggle" target={collapsedId} />
          <Behavior action="toggle" target={expandedId} />
        </View>
      </View>
      <View id={expandedId} hide="true">
        <Text style={textStyle}>{bio}</Text>
        <View style="spotlight-bio-toggle">
          <Text style="spotlight-bio-toggle-label">Show less</Text>
          <Behavior action="toggle" target={collapsedId} />
          <Behavior action="toggle" target={expandedId} />
        </View>
      </View>
    </View>
  );
};

export default ExpandableBio;

export const expandableBioStyles = () => (
  <>
    <Style id="spotlight-bio-toggle" paddingTop={4} paddingBottom={4} />
    <Style
      id="spotlight-bio-toggle-label"
      fontSize={14}
      fontWeight="600"
      color="#a22c29"
    />
  </>
);
