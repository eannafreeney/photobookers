import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { botdPath } from "../../../app/spotlightUrls";
import { formatOrdinalDate } from "../../../../lib/utils";

export type ThisWeekBookEntryData = {
  id: string;
  date: Date;
  instagramCaption?: string | null;
  book: {
    coverUrl: string | null;
    title: string;
    artist?: { displayName: string } | null;
  };
};

type Props = {
  entry: ThisWeekBookEntryData;
  baseUrl: string;
};

const ThisWeekBookEntry: FC<Props> = ({ entry, baseUrl }) => {
  const { book } = entry;
  const href = `${baseUrl}/hyperview${botdPath(entry.date)}`;

  return (
    <View style="spotlight-botd-entry">
      {book.coverUrl ? (
        <Image
          source={book.coverUrl}
          style="spotlight-botd-cover"
          resize-mode="cover"
        />
      ) : (
        <View style="spotlight-botd-cover" />
      )}
      <View style="spotlight-botd-text">
        <Text style="spotlight-botd-date">
          {formatOrdinalDate(entry.date).toUpperCase()}
        </Text>
        <Text style="spotlight-botd-title">{book.title}</Text>
        {book.artist ? (
          <Text style="spotlight-botd-artist">{book.artist.displayName}</Text>
        ) : null}
        <View style="spotlight-botd-btn">
          <Text style="spotlight-botd-btn-label">View</Text>
          <Behavior href={href} />
        </View>
      </View>
    </View>
  );
};

export default ThisWeekBookEntry;

export const thisWeekBookEntryStyles = () => (
  <>
    <Style
      id="spotlight-botd-entry"
      flexDirection="row"
      gap={12}
      padding={12}
      borderWidth={1}
      borderColor="#e4e0d5"
      borderRadius={0}
      marginBottom={12}
      backgroundColor="#fbfaf7"
    />
    <Style
      id="spotlight-botd-cover"
      width={96}
      height={128}
      borderRadius={0}
      flexShrink={0}
    />
    <Style id="spotlight-botd-text" flex={1} gap={4} />
    <Style
      id="spotlight-botd-date"
      fontSize={10}
      fontWeight="600"
      letterSpacing={1.5}
      color="#a22c29"
    />
    <Style
      id="spotlight-botd-title"
      fontFamily="Fraunces-Medium"
      fontSize={16}
      color="#191613"
    />
    <Style id="spotlight-botd-artist" fontSize={13} color="#45413a" />
    <Style
      id="spotlight-botd-teaser"
      fontSize={12}
      color="#45413a"
      lineHeight={18}
    />
    <Style
      id="spotlight-botd-btn"
      borderWidth={1}
      borderColor="#191613"
      borderRadius={0}
      paddingTop={8}
      paddingBottom={8}
      alignItems="center"
      marginTop={8}
    />
    <Style
      id="spotlight-botd-btn-label"
      fontSize={13}
      fontWeight="600"
      color="#191613"
    />
  </>
);
