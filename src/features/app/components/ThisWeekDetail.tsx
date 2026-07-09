import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import ShareButton from "../../api/components/ShareButton";
import SpotlightCreatorLink from "./SpotlightCreatorLink";
import InterviewPreviewSection, {
  type InterviewPreview,
} from "./InterviewPreviewSection";
import NewsletterCard from "./NewsletterCard";
import { AuthUser } from "../../../../types";
import { bookOfTheDay, Creator } from "../../../db/schema";
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
import ExpandableDescription from "./ExpandableDescription";
import { resolveSpotlightCopy } from "../spotlightCopy";
import { toDateString, toWeekStart } from "../../../lib/utils";
import { capitalize } from "../../../utils";
import SpotlightCard from "@/components/app/SpotlightCard";

type Props = {
  weekStart: Date;
  weekRangeLabel: string;
  botdEntries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const ThisWeekDetail = async ({
  weekStart,
  weekRangeLabel,
  botdEntries,
  artistOfTheWeek,
  publisherOfTheWeek,
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
          <h1 class="text-balance font-display text-1xl md:text-2xl font-medium leading-tight text-on-surface-strong">
            {weekRangeLabel}
          </h1>
        </div>
        <ShareButton
          title={`This week on Photobookers — ${weekRangeLabel}`}
          text={`This week on Photobookers: ${weekRangeLabel}`}
          url={thisWeekUrl(weekStart)}
        />
      </header>

      {/* {botdEntries.length > 0 ? (
        <section class="flex flex-col gap-8">
          <SectionTitle>Books of the Day</SectionTitle>
          <div class="flex flex-col gap-8">
            {botdEntries.map((entry) => (
              <ThisWeekBookEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null} */}

      {botdEntries.map((bookOfTheDay) => {
        return (
          <section class="flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4">
            <SectionTitle>{toDateString(bookOfTheDay.date)}</SectionTitle>
            <SpotlightCard
              href={botdPath(bookOfTheDay.date)}
              imageUrl={bookOfTheDay.book.coverUrl ?? ""}
              imageAlt={bookOfTheDay.book.title}
              title={bookOfTheDay.book.title}
              subtitle={bookOfTheDay.book.artist?.displayName}
              className="w-full max-w-none"
            />
            {bookOfTheDay.spotlightBlurb ? (
              <ExpandableDescription text={bookOfTheDay.spotlightBlurb} />
            ) : null}
          </section>
        );
      })}

      {artistOfTheWeek ? (
        <section class="flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4">
          <SectionTitle>
            Artist of the Week {toDateString(artistOfTheWeek.weekStart)}
          </SectionTitle>
          <SpotlightCard
            href={aotwPath(artistOfTheWeek.weekStart)}
            imageUrl={
              artistOfTheWeek.featuredImageUrl ??
              artistOfTheWeek.creator.coverUrl ??
              ""
            }
            imageAlt={artistOfTheWeek.creator.displayName}
            title={artistOfTheWeek.creator.displayName}
            subtitle={artistOfTheWeek.creator.city ?? undefined}
            className="w-full max-w-none"
          />
          {artistOfTheWeek.spotlightBlurb ? (
            <ExpandableDescription text={artistOfTheWeek.spotlightBlurb} />
          ) : null}
        </section>
      ) : // <ThisWeekCreatorSpotlight spotlight={artistOfTheWeek} />
      null}

      {publisherOfTheWeek ? (
        <section class="flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4">
          <SectionTitle>
            Publisher of the Week {toDateString(publisherOfTheWeek.weekStart)}
          </SectionTitle>
          <SpotlightCard
            href={potwPath(publisherOfTheWeek.weekStart)}
            imageUrl={
              publisherOfTheWeek.featuredImageUrl ??
              publisherOfTheWeek.creator.coverUrl ??
              ""
            }
            imageAlt={publisherOfTheWeek.creator.displayName}
            title={publisherOfTheWeek.creator.displayName}
            subtitle={publisherOfTheWeek.creator.city ?? undefined}
            className="w-full max-w-none"
          />
          {publisherOfTheWeek.spotlightBlurb ? (
            <ExpandableDescription text={publisherOfTheWeek.spotlightBlurb} />
          ) : null}
        </section>
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
