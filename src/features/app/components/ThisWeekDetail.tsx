import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import ShareButton from "../../api/components/ShareButton";
import SpotlightCreatorLink from "./SpotlightCreatorLink";
import InterviewPreviewSection, {
  type InterviewPreview,
} from "./InterviewPreviewSection";
import NewsletterCard from "./NewsletterCard";
import { AuthUser } from "../../../../types";
import { Creator } from "../../../db/schema";
import { BookOfTheDayWithBook } from "../BOTDServices";
import { ArtistOfTheWeekWithCreator } from "../AOTWServices";
import { PublisherOfTheWeekWithCreator } from "../POTWServices";
import {
  aotwPath,
  botdPath,
  potwPath,
  thisWeekPath,
  thisWeekUrl,
} from "../spotlightUrls";
import { toDateString, toWeekStart } from "../../../lib/utils";
import { capitalize } from "../../../utils";

type Props = {
  weekStart: Date;
  weekRangeLabel: string;
  botdEntries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  artistInterview: InterviewPreview | null;
  publisherInterview: InterviewPreview | null;
};

const ThisWeekDetail = async ({
  weekStart,
  weekRangeLabel,
  botdEntries,
  artistOfTheWeek,
  publisherOfTheWeek,
  artistInterview,
  publisherInterview,
}: Props) => {
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

  const canGoNext =
    nextWeekStart.getTime() <= toWeekStart(new Date()).getTime();

  return (
    <div class="mx-auto flex w-full flex-col gap-4 md:max-w-lg">
      <header class="flex flex-col items-center gap-3 border-b-2 border-on-surface-strong pb-6">
        <div class="flex flex-col items-center gap-2 text-center">
          <p class="kicker text-accent">This Week</p>
          <h1 class="text-balance font-display text-3xl md:text-4xl font-medium leading-tight text-on-surface-strong">
            {weekRangeLabel}
          </h1>
        </div>
        <ShareButton
          title={`This week on Photobookers — ${weekRangeLabel}`}
          text={`This week on Photobookers: ${weekRangeLabel}`}
          url={thisWeekUrl(weekStart)}
        />
      </header>

      {botdEntries.length > 0 ? (
        <section class="flex flex-col gap-8">
          <SectionTitle>Books of the Day</SectionTitle>
          <div class="flex flex-col gap-8">
            {botdEntries.map((entry) => (
              <ThisWeekBookEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {artistOfTheWeek ? (
        <ThisWeekCreatorSpotlight
          spotlight={artistOfTheWeek}
          spotlightHref={aotwPath(weekStart)}
          publishedInterview={artistInterview}
        />
      ) : null}

      {publisherOfTheWeek ? (
        <ThisWeekCreatorSpotlight
          spotlight={publisherOfTheWeek}
          spotlightHref={potwPath(weekStart)}
          publishedInterview={publisherInterview}
        />
      ) : null}

      <NewsletterCard />

      <nav class="flex items-center justify-between gap-4 border-outline pt-4">
        <a href={thisWeekPath(prevWeekStart)}>
          <Button variant="outline" color="primary" width="full">
            ← Previous week
          </Button>
        </a>
        {canGoNext ? (
          <a href={thisWeekPath(nextWeekStart)}>
            <Button variant="outline" color="primary" width="full">
              Next week →
            </Button>
          </a>
        ) : (
          <Button variant="outline" color="primary" width="full" isDisabled>
            Next week →
          </Button>
        )}
      </nav>
    </div>
  );
};

export default ThisWeekDetail;

const ThisWeekBookEntry = ({ entry }: { entry: BookOfTheDayWithBook }) => {
  const { book } = entry;
  const editorial = entry.instagramCaption?.trim();

  return (
    <a
      href={botdPath(entry.date)}
      class="group flex gap-4 border-t border-outline pt-4 transition-opacity hover:opacity-80"
    >
      {book.coverUrl && (
        <img
          src={book.coverUrl}
          alt={book.title}
          class="aspect-3/4 w-24 shrink-0 object-cover border border-outline"
        />
      )}
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <p class="kicker text-accent">{toDateString(entry.date)}</p>
        <p class="text-pretty font-display text-xl font-medium text-on-surface-strong group-hover:underline decoration-accent decoration-1 underline-offset-4">
          {book.title}
        </p>
        {book.artist ? (
          <p class="truncate text-sm text-on-surface">
            {book.artist.displayName}
          </p>
        ) : null}
        {editorial ? (
          <p class="line-clamp-2 text-pretty text-xs text-on-surface">
            {editorial}
          </p>
        ) : null}
      </div>
    </a>
  );
};

type ThisWeekCreatorSpotlightProps = {
  spotlight: ArtistOfTheWeekWithCreator | PublisherOfTheWeekWithCreator;
  spotlightHref: string;
  publishedInterview: InterviewPreview | null;
};

const ThisWeekCreatorSpotlight = async ({
  spotlight,
  spotlightHref,
  publishedInterview,
}: ThisWeekCreatorSpotlightProps) => {
  const { creator } = spotlight;
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const image =
    spotlight.instagramImageUrl ?? creator.coverUrl ?? creator.bannerUrl;

  return (
    <section class="flex flex-col gap-6">
      <SectionTitle>{title}</SectionTitle>

      {image ? (
        <img
          src={image}
          alt={creator.displayName}
          class="w-full rounded-radius object-cover"
        />
      ) : null}

      {creator.tagline?.trim() ? (
        <p class="text-pretty text-sm font-medium text-on-surface-strong">
          {creator.tagline.trim()}
        </p>
      ) : null}

      <SpotlightCreatorLink creator={creator as Creator} role={role} />

      {publishedInterview ? (
        <InterviewPreviewSection
          interview={publishedInterview}
          widthClass="w-full"
        />
      ) : null}
    </section>
  );
};
