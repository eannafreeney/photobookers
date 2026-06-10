import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { bookCardStyles } from "../BookCard";
import { interviewCardStyles } from "../InterviewCard";
import { newsletterCardStyles } from "../NewsletterCard";
import { sectionHeaderStyles } from "../SectionHeader";
import { signInPromptStyles } from "../SignInPrompt";
import { spotlightHeaderStyles } from "./SpotlightHeader";
import { Creator } from "../../../../db/schema";
import { BookCardResult } from "../../../../constants/queries";
import BookCard from "../BookCard";
import NewsletterCard from "../NewsletterCard";
import SectionHeader from "../SectionHeader";
import { followButtonStyles } from "../FollowButton";
import ExpandableBio, { expandableBioStyles } from "./ExpandableBio";
import SpotlightHeader from "./SpotlightHeader";
import { formatCreatorLocation, toWeekString } from "../../../../lib/utils";
import type { InterviewPreview } from "../../../app/components/InterviewPreviewSection";
import CreatorActions, { creatorActionsStyles } from "./CreatorActions";
import InterviewSection, { interviewSectionStyles } from "./InterviewSection";
import SecondaryButtonLink from "../SecondaryButtonLink";
import { cotwIndexPath } from "../../../app/spotlightUrls";

type Props = {
  creator: Creator;
  weekStart: Date;
  publishedInterview: InterviewPreview | null;
  books: BookCardResult[];
  baseUrl: string;
  isFollowing: boolean;
  favoritesByBookId: Record<string, boolean>;
  spotlightImage?: string | null;
};

const CreatorOfTheWeekSpotlightBody: FC<Props> = ({
  creator,
  weekStart,
  publishedInterview,
  books,
  baseUrl,
  isFollowing,
  favoritesByBookId,
  spotlightImage,
}) => {
  const isArtist = creator.type === "artist";
  const bio = creator.bio?.trim() || null;
  const location = formatCreatorLocation(creator.city, creator.country);
  const subtitle = [location, toWeekString(weekStart)]
    .filter(Boolean)
    .join(" · ");

  const coverImage =
    spotlightImage ?? creator.coverUrl ?? creator.bannerUrl ?? null;
  const interviewUrl = publishedInterview
    ? `${baseUrl}/hyperview/interviews/view/${publishedInterview.creator.slug}`
    : null;
  const interviewTeaser = publishedInterview?.answers?.q1?.trim();

  return (
    <View style="spotlight-body">
      <SpotlightHeader title={creator.displayName} subtitle={subtitle} />
      {coverImage ? (
        <Image
          source={coverImage}
          style="spotlight-cover"
          resize-mode="cover"
        />
      ) : null}
      <CreatorActions
        creator={creator}
        baseUrl={baseUrl}
        isFollowing={isFollowing}
        weekStart={weekStart}
        coverImage={coverImage}
      />
      {bio ? <ExpandableBio bio={bio} id={creator.id} /> : null}
      <View style="spotlight-profile-btn">
        <Text style="spotlight-profile-btn-label">
          Visit {creator.displayName}'s profile
        </Text>
        <Behavior
          href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
        />
      </View>
      <NewsletterCard baseUrl={baseUrl} />
      {publishedInterview && interviewUrl && (
        <InterviewSection
          publishedInterview={publishedInterview}
          interviewUrl={interviewUrl}
          interviewTeaser={interviewTeaser}
          creator={creator}
        />
      )}

      {books.length > 0 ? (
        <View>
          <SectionHeader title={`Books by ${creator.displayName}`} />
          <View style="spotlight-books-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                baseUrl={baseUrl}
                currentCreatorId={creator.id}
                isFavorited={favoritesByBookId[book.id] ?? false}
              />
            ))}
          </View>
        </View>
      ) : null}
      <SecondaryButtonLink
        label="All Artist of the Weeks →"
        href={`${baseUrl}/hyperview${cotwIndexPath(isArtist)}`}
      />
    </View>
  );
};

export default CreatorOfTheWeekSpotlightBody;

export const creatorOfTheWeekSpotlightBodyStyles = () => (
  <>
    <Style id="spotlight-body" flexDirection="column" gap={12} />
    <Style id="spotlight-cover" width="100%" height={280} borderRadius={8} />
    <Style
      id="spotlight-body-text"
      fontSize={14}
      color="#444444"
      lineHeight={22}
    />
    <Style
      id="spotlight-profile-btn"
      borderWidth={1}
      borderColor="#111111"
      borderRadius={8}
      paddingTop={12}
      paddingBottom={12}
      alignItems="center"
      marginBottom={16}
    />
    <Style
      id="spotlight-profile-btn-label"
      fontSize={14}
      fontWeight="600"
      color="#111111"
    />
    <Style id="spotlight-books-grid" gap={12} />
  </>
);

export const creatorOfTheWeekSpotlightPageStyles = () => (
  <>
    {spotlightHeaderStyles()}
    {creatorOfTheWeekSpotlightBodyStyles()}
    {expandableBioStyles()}
    {followButtonStyles()}
    {creatorActionsStyles()}
    {newsletterCardStyles()}
    {interviewCardStyles()}
    {bookCardStyles()}
    {sectionHeaderStyles()}
    {signInPromptStyles()}
    {interviewSectionStyles()}
  </>
);
