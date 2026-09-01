import { FC } from "hono/jsx";
import { Style, View } from "../../../../lib/hxml-comps";
import { newsletterCardStyles } from "../NewsletterCard";
import { sectionHeaderStyles } from "../SectionHeader";
import { signInPromptStyles } from "../SignInPrompt";
import { spotlightHeaderStyles } from "./SpotlightHeader";
import { spotlightShareStyles } from "./SpotlightShare";
import ThisWeekBookEntry, {
  thisWeekBookEntryStyles,
} from "./ThisWeekBookEntry";
import ThisWeekCreatorSection, {
  thisWeekCreatorSectionStyles,
} from "./ThisWeekCreatorSection";
import ThisWeekNav, { thisWeekNavStyles } from "./ThisWeekNav";
import { BookOfTheDayWithBook } from "../../../app/BOTDServices";
import { ArtistOfTheWeekWithCreator } from "../../../app/AOTWServices";
import { PublisherOfTheWeekWithCreator } from "../../../app/POTWServices";
import NewsletterCard from "../NewsletterCard";
import SectionHeader from "../SectionHeader";
import SpotlightHeader from "./SpotlightHeader";

type Props = {
  baseUrl: string;
  weekStart: Date;
  weekRangeLabel: string;
  botdEntries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const ThisWeekSpotlightBody: FC<Props> = ({
  baseUrl,
  weekStart,
  weekRangeLabel,
  botdEntries,
  artistOfTheWeek,
  publisherOfTheWeek,
}) => (
  <View>
    <SpotlightHeader
      title="This week on Photobookers"
      subtitle={weekRangeLabel}
    />
    {botdEntries.length > 0 && (
      <View style="spotlight-books-of-the-day">
        <SectionHeader title="Books of the Day" />
        {botdEntries.map((entry) => (
          <ThisWeekBookEntry key={entry.id} entry={entry} baseUrl={baseUrl} />
        ))}
      </View>
    )}
    {artistOfTheWeek && (
      <ThisWeekCreatorSection
        spotlight={artistOfTheWeek}
        spotlightHref={`${baseUrl}/hyperview/creators/${artistOfTheWeek.creator.id}/tab/books`}
      />
    )}
    {publisherOfTheWeek && (
      <ThisWeekCreatorSection
        spotlight={publisherOfTheWeek}
        spotlightHref={`${baseUrl}/hyperview/creators/${publisherOfTheWeek.creator.id}/tab/books`}
      />
    )}
    <NewsletterCard baseUrl={baseUrl} />
    <ThisWeekNav baseUrl={baseUrl} weekStart={weekStart} />
  </View>
);

export default ThisWeekSpotlightBody;

export const thisWeekSpotlightPageStyles = () => (
  <>
    <Style
      id="spotlight-books-of-the-day"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
      paddingBottom={16}
      marginBottom={16}
      gap={8}
    />
    {spotlightHeaderStyles()}
    {spotlightShareStyles()}
    {thisWeekBookEntryStyles()}
    {thisWeekCreatorSectionStyles()}
    {thisWeekNavStyles()}
    {newsletterCardStyles()}
    {sectionHeaderStyles()}
    {signInPromptStyles()}
  </>
);
