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

type Props = {
  creator: Creator;
  user: AuthUser | null;
  weekStart: Date;
  editorial?: string | null;
  publishedInterview: InterviewPreview | null;
  books: BookCardResult[];
};

const CreatorOfTheWeekDetail = async ({
  creator,
  user,
  weekStart,
  editorial,
  publishedInterview,
  books,
}: Props) => {
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const tagline = creator.tagline?.trim() || null;
  const bio = creator.bio?.trim() || null;
  const profileHref = `/creators/${creator.slug}`;
  const isSingleBook = books.length === 1;
  const location = formatCreatorLocation(creator.city, creator.country);

  return (
    <div class="mx-auto flex w-full flex-col gap-8 md:max-w-lg">
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

      <div class="flex justify-center">
        <ShareButton isCircleButton />
      </div>

      {editorial?.trim() ? (
        <ExpandableDescription text={editorial.trim()} />
      ) : null}

      {tagline ? (
        <p class="text-pretty text-sm font-medium text-on-surface-strong">
          {tagline}
        </p>
      ) : null}

      {bio ? <ExpandableDescription text={bio} /> : null}

      <NewsletterCard />

      {publishedInterview ? (
        <InterviewPreviewSection
          interview={publishedInterview}
          widthClass="w-full"
        />
      ) : null}

      <SpotlightCreatorLink creator={creator} role={role} user={user} />

      <a href={profileHref}>
        <Button variant="outline" color="primary" width="full">
          Visit {creator.displayName}'s profile
        </Button>
      </a>

      {books.length > 0 ? (
        <section class="flex flex-col gap-4">
          <SectionTitle>Books by {creator.displayName}</SectionTitle>
          <div
            class={
              isSingleBook ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"
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
