import { FC } from "hono/jsx";
import { Style, Text, View } from "../../../../lib/hxml-comps";
import { bookActionsStyles } from "../BookActions";
import { bookGalleryStyles } from "../BookGallery";
import { bookPageStyles } from "../BookPage";
import { newsletterCardStyles } from "../NewsletterCard";
import { secondaryButtonLinkStyles } from "../SecondaryButtonLink";
import SecondaryButtonLink from "../SecondaryButtonLink";
import { signInPromptStyles } from "../SignInPrompt";
import { spotlightCreatorRowStyles } from "./SpotlightCreatorRow";
import { spotlightHeaderStyles } from "./SpotlightHeader";
import { BookWithGalleryImages } from "../../../app/types";
import BookActions from "../BookActions";
import BookGallery from "../BookGallery";
import NewsletterCard from "../NewsletterCard";
import SpotlightHeader from "./SpotlightHeader";
import SpotlightCreatorRow from "./SpotlightCreatorRow";
import { Creator } from "../../../../db/schema";
import { botdIndexPath, botdPath } from "../../../app/spotlightUrls";
import DiscoveryTags from "../DiscoveryTags";
import ExpandableBio from "./ExpandableBio";

type Props = {
  book: BookWithGalleryImages;
  galleryImages: string[];
  date: Date;
  editorial?: string | null;
  baseUrl: string;
  isFavorited: boolean;
  followingByCreatorId: Record<string, boolean>;
};

const BookOfTheDaySpotlightBody: FC<Props> = ({
  book,
  galleryImages,
  date,
  editorial,
  baseUrl,
  isFavorited,
  followingByCreatorId,
}) => {
  const shareUrl = `${baseUrl}${botdPath(date)}`;
  const description = book.description?.trim() || editorial?.trim() || null;

  return (
    <View style="spotlight-body">
      <BookGallery galleryImages={galleryImages} />
      <View>
        <Text style="title">{book.title}</Text>
        <Text style="subtitle">{book.artist?.displayName}</Text>
      </View>
      <BookActions
        book={book}
        baseUrl={baseUrl}
        isFavorited={isFavorited}
        shareUrl={shareUrl}
        shareTitle={`Book of the Day — ${book.title}`}
        shareMessage={`Check out ${book.title} on Photobookers`}
      />
      {description ? <ExpandableBio bio={description} id={book.id} /> : null}
      <NewsletterCard baseUrl={baseUrl} />
      {book.artist ? (
        <SpotlightCreatorRow
          creator={book.artist as Creator}
          role="Artist"
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[book.artist.id] ?? false}
        />
      ) : null}
      {book.publisher ? (
        <SpotlightCreatorRow
          creator={book.publisher as Creator}
          role="Publisher"
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[book.publisher.id] ?? false}
        />
      ) : null}
      <DiscoveryTags baseUrl={baseUrl} tags={book.tags ?? []} />
      <SecondaryButtonLink
        label="All Books of the Day →"
        href={`${baseUrl}/hyperview${botdIndexPath()}`}
      />
    </View>
  );
};

export default BookOfTheDaySpotlightBody;

export const bookOfTheDaySpotlightBodyStyles = () => (
  <>
    <Style
      id="title"
      fontSize={22}
      fontWeight="700"
      color="#111111"
      marginBottom={6}
    />
    <Style id="subtitle" fontSize={15} color="#666666" marginBottom={16} />
    <Style id="spotlight-body" flexDirection="column" gap={12} />
    <Style
      id="spotlight-body-text"
      fontSize={14}
      color="#444444"
      lineHeight={22}
    />
  </>
);

export const bookOfTheDaySpotlightPageStyles = () => (
  <>
    {spotlightHeaderStyles()}
    {spotlightCreatorRowStyles()}
    {bookOfTheDaySpotlightBodyStyles()}
    {bookActionsStyles()}
    {bookGalleryStyles()}
    {bookPageStyles()}
    {newsletterCardStyles()}
    {secondaryButtonLinkStyles()}
    {signInPromptStyles()}
  </>
);
