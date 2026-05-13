import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { getCreatorsByCreatorId } from "../../app/services";

type Props = {
  creatorId: string;
  creatorType: "artist" | "publisher";
  baseUrl?: string;
  title?: string;
};

const CreatorsGrid: FC<Props> = async ({
  creatorId,
  creatorType,
  baseUrl = "",
  title,
}) => {
  const [error, result] = await getCreatorsByCreatorId(creatorId, creatorType);
  if (error || !result?.creators || result.creators.length === 0) return <></>;

  const { creators } = result;

  return (
    <View style="creators-grid-section">
      {title && <Text style="creators-grid-title">{title}</Text>}
      <View style="creators-grid">
        {creators.map((creator) => (
          <View key={creator.id} style="creator-circle">
            <Behavior
              trigger="press"
              action="push"
              href={`${baseUrl}/hyperview/creators/${creator.slug}/tab/books`}
            />
            {creator.coverUrl && (
              <Image
                source={creator.coverUrl}
                style="creator-circle-avatar"
                resize-mode="cover"
              />
            )}
            <Text style="creator-circle-name" number-of-lines={1}>
              {creator.displayName}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CreatorsGrid;

export const creatorsGridStyles = () => (
  <>
    <Style id="creators-grid-section" flexDirection="column" gap={12} />
    <Style
      id="creators-grid-title"
      fontSize={16}
      fontWeight="700"
      color="#111111"
      marginBottom={4}
    />
    <Style id="creators-grid" flexDirection="row" flexWrap="wrap" />
    <Style
      id="creator-circle"
      alignItems="center"
      width="50%"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    />
    <Style
      id="creator-circle-avatar"
      width={64}
      height={64}
      borderRadius={32}
      overflow="hidden"
      marginBottom={6}
    />
    <Style
      id="creator-circle-avatar-placeholder"
      width={64}
      height={64}
      borderRadius={32}
      backgroundColor="#e5e5e5"
      marginBottom={6}
    />
    <Style
      id="creator-circle-name"
      fontSize={12}
      color="#111111"
      textAlign="center"
    />
  </>
);
