import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { bookCardStyles } from "../BookCard";
import { interviewCardStyles } from "../InterviewCard";
import { newsletterCardStyles } from "../NewsletterCard";
import { sectionHeaderStyles } from "../SectionHeader";
import { signInPromptStyles } from "../SignInPrompt";
import { bookActionsStyles } from "../BookActions";
import { spotlightHeaderStyles } from "./SpotlightHeader";
import { xmlText } from "../../../../lib/hxml";
import { Creator } from "../../../../db/schema";
import { BookCardResult } from "../../../../constants/queries";
import BookCard from "../BookCard";
import InterviewCard from "../InterviewCard";
import NewsletterCard from "../NewsletterCard";
import SectionHeader from "../SectionHeader";
import FollowButton, { followButtonStyles } from "../FollowButton";
import SpotlightHeader from "./SpotlightHeader";
import { formatCreatorLocation, toWeekString } from "../../../../lib/utils";
import { capitalize } from "../../../../utils";
import { aotwPath, potwPath } from "../../../app/spotlightUrls";
import type { InterviewPreview } from "../../../app/components/InterviewPreviewSection";

type Props = {
  creator: Creator;
  weekStart: Date;
  editorial?: string | null;
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
  editorial,
  publishedInterview,
  books,
  baseUrl,
  isFollowing,
  favoritesByBookId,
  spotlightImage,
}) => {
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const tagline = creator.tagline?.trim() || null;
  const bio = creator.bio?.trim() || null;
  const location = formatCreatorLocation(creator.city, creator.country);
  const subtitle = [location, toWeekString(weekStart)]
    .filter(Boolean)
    .join(" · ");
  const sharePath =
    creator.type === "artist" ? aotwPath(weekStart) : potwPath(weekStart);
  const shareUrl = `${baseUrl}${sharePath}`;
  const coverImage =
    spotlightImage ?? creator.coverUrl ?? creator.bannerUrl ?? null;
  const interviewUrl = publishedInterview
    ? `${baseUrl}/hyperview/interviews/view/${publishedInterview.creator.slug}`
    : null;
  const interviewTeaser = publishedInterview?.answers?.q1?.trim();

  return (
    <View>
      <SpotlightHeader title={creator.displayName} subtitle={subtitle} />
      {coverImage ? (
        <Image
          source={coverImage}
          style="spotlight-cover"
          resize-mode="cover"
        />
      ) : null}
      <View style="book-actions-row">
        <View style="book-action-cell">
          <FollowButton
            creatorId={creator.id}
            baseUrl={baseUrl}
            isActive={isFollowing}
          />
        </View>
        <View style="book-action-cell">
          <View style="book-action-block">
            <Image
              source={`${baseUrl}/icons/share.png`}
              style="book-action-icon"
              resize-mode="contain"
            />
            <Text style="book-action-label">Share</Text>
            <Behavior
              action="share"
              href={shareUrl}
              share-url={xmlText(shareUrl)}
              share-message={xmlText(
                `Check out ${creator.displayName} on Photobookers`,
              )}
              share-title={xmlText(`${title} — ${creator.displayName}`)}
              {...(coverImage ? { "share-image": xmlText(coverImage) } : {})}
            />
          </View>
        </View>
      </View>
      {editorial ? <Text style="spotlight-body-text">{editorial}</Text> : null}
      {tagline ? <Text style="spotlight-tagline">{tagline}</Text> : null}
      {bio ? <Text style="spotlight-body-text">{bio}</Text> : null}
      <View style="spotlight-profile-btn">
        <Text style="spotlight-profile-btn-label">
          Visit {creator.displayName}'s profile
        </Text>
        <Behavior
          href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
        />
      </View>
      <NewsletterCard baseUrl={baseUrl} />
      {publishedInterview && interviewUrl ? (
        <View>
          <SectionHeader title="Interview" />
          {publishedInterview.promoImageUrl ? (
            <InterviewCard
              interview={publishedInterview}
              href={interviewUrl}
              variant="list"
            />
          ) : null}
          {interviewTeaser ? (
            <Text style="spotlight-interview-teaser">{interviewTeaser}</Text>
          ) : null}
          <View>
            <Text style="spotlight-interview-link">
              Read the full interview with {creator.displayName}
            </Text>
            <Behavior href={interviewUrl} />
          </View>
        </View>
      ) : null}

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
    </View>
  );
};

export default CreatorOfTheWeekSpotlightBody;

export const creatorOfTheWeekSpotlightBodyStyles = () => (
  <>
    <Style
      id="spotlight-cover"
      width="100%"
      height={280}
      borderRadius={8}
      marginBottom={16}
    />
    <Style
      id="spotlight-body-text"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={12}
    />
    <Style
      id="spotlight-tagline"
      fontSize={14}
      fontWeight="600"
      color="#111111"
      marginBottom={12}
    />
    <Style
      id="spotlight-interview-teaser"
      fontSize={14}
      color="#444444"
      lineHeight={20}
      marginBottom={8}
    />
    <Style
      id="spotlight-interview-link"
      fontSize={14}
      color="#3366cc"
      marginBottom={16}
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
    {followButtonStyles()}
    {bookActionsStyles()}
    {newsletterCardStyles()}
    {interviewCardStyles()}
    {bookCardStyles()}
    {sectionHeaderStyles()}
    {signInPromptStyles()}
  </>
);
