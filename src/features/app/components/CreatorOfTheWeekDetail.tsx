import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import BookCard from "../../../components/app/BookCard";
import ShareButton from "../../api/components/ShareButton";
import SpotlightCreatorLink from "./SpotlightCreatorLink";
import { AuthUser } from "../../../../types";
import { Creator } from "../../../db/schema";
import ExpandableDescription from "./ExpandableDescription";
import InterviewPreviewSection, {
  type InterviewPreview,
} from "./InterviewPreviewSection";
import NewsletterCard from "./NewsletterCard";
import { formatCreatorLocation } from "../../../lib/utils";
import { BookCardResult } from "../../../constants/queries";
import FeaturedPageHeader from "./FeaturedPageHeader";
import { capitalize } from "../../../utils";
import { aotwUrl, potwUrl } from "../spotlightUrls";
import FollowButton from "../../api/components/FollowButton";
import {
  creatorOfTheWeekShareText,
  creatorOfTheWeekShareTitle,
} from "../../../lib/share";

type Props = {
  creator: Creator;
  user: AuthUser | null;
  weekStart: Date;
  publishedInterview: InterviewPreview | null;
  books: BookCardResult[];
  spotlightBlurb?: string | null;
};

const CreatorOfTheWeekDetail = async ({
  creator,
  user,
  weekStart,
  publishedInterview,
  books,
  spotlightBlurb,
}: Props) => {
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const bio = spotlightBlurb?.trim() || creator.bio?.trim() || null;
  const isSingleBook = books.length === 1;
  const location = formatCreatorLocation(creator.city, creator.country);
  const spotlightUrl =
    creator.type === "artist" ? aotwUrl(weekStart) : potwUrl(weekStart);

  return (
    <div class="mx-auto flex w-full flex-col gap-6  md:max-w-xl">
      <FeaturedPageHeader
        title={title}
        name={creator.displayName}
        weekStart={weekStart}
        location={location}
      />
      {creator.coverUrl ? (
        <img
          src={creator.coverUrl}
          alt={creator.displayName}
          class="w-full rounded-radius object-cover"
        />
      ) : null}
      <div class="flex gap-2 justify-center">
        <FollowButton creator={creator} user={user} />
        <ShareButton
          title={creatorOfTheWeekShareTitle(creator, role)}
          text={creatorOfTheWeekShareText(creator, role)}
          url={spotlightUrl}
        />
      </div>
      {bio ? <ExpandableDescription text={bio} /> : null}
      <NewsletterCard />
      {publishedInterview ? (
        <InterviewPreviewSection
          interview={publishedInterview}
          widthClass="w-full"
        />
      ) : null}

      <SpotlightCreatorLink creator={creator} role={role} />

      {books.length > 0 ? (
        <section class="flex flex-col gap-4">
          <SectionTitle>Books by {creator.displayName}</SectionTitle>
          <div
            class={
              isSingleBook
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-1 md:grid-cols-2 gap-4"
            }
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                user={user}
                currentCreatorId={creator.id}
                className="w-full min-w-0 max-w-none"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default CreatorOfTheWeekDetail;
