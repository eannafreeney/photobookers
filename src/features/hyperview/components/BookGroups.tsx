import { FC } from "hono/jsx";
import { ScrollView, Style, View } from "../../../lib/hxml-comps";
import { FEATURED_BOOK_GROUPS } from "../../../constants/featuredBookGroups";
import { hyperviewTagBooksUrl } from "../../../lib/tags";
import { loadFeaturedBookGroupCovers } from "../../app/services";
import SectionHeader from "./SectionHeader";
import GroupCard, { groupCardStyles } from "./GroupCard";

type Props = {
  baseUrl?: string;
};

const BookGroups: FC<Props> = async ({ baseUrl = "" }) => {
  const covers = await loadFeaturedBookGroupCovers();

  return (
    <View style="book-groups-section">
      <SectionHeader title="Groups" />

      <ScrollView
        style="book-groups-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {FEATURED_BOOK_GROUPS.map((tag) => (
          <GroupCard
            key={tag}
            tag={tag}
            href={hyperviewTagBooksUrl(baseUrl, tag)}
            coverUrl={covers.get(tag) ?? null}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default BookGroups;

export const bookGroupsStyles = () => (
  <>
    <Style
      id="book-groups-section"
      flexDirection="column"
      gap={12}
      marginBottom={12}
    />
    <Style id="book-groups-scroll" flexDirection="row" />
    {groupCardStyles()}
  </>
);
