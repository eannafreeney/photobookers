import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import ShareButton from "../../api/components/ShareButton";
import NewsletterCard from "./NewsletterCard";
import ExpandableDescription from "./ExpandableDescription";
import { resolveSpotlightCopy } from "../spotlightCopy";
import { BookOfTheDayWithBook } from "../BOTDServices";
import { ArtistOfTheWeekWithCreator } from "../AOTWServices";
import { PublisherOfTheWeekWithCreator } from "../POTWServices";
import {
  bookPath,
  creatorPath,
  thisWeekPath,
  thisWeekUrl,
} from "../spotlightUrls";
import { toDateString, toWeekStart } from "../../../lib/utils";
import SpotlightCard from "@/components/app/SpotlightCard";
import type { TrendingForRange } from "../../../domain/planner/trending";
import type { NewlyVerifiedCreator } from "../../../domain/newsletters/newMembers";
import type { ChildType } from "../../../../types";

type Props = {
  weekStart: Date;
  weekRangeLabel: string;
  botdEntries: BookOfTheDayWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  trending: TrendingForRange;
  newMembers: NewlyVerifiedCreator[];
};

const ThisWeekDetail = async ({
  weekStart,
  weekRangeLabel,
  botdEntries,
  artistOfTheWeek,
  publisherOfTheWeek,
  trending,
  newMembers,
}: Props) => {
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

  const canGoNext =
    nextWeekStart.getTime() <= toWeekStart(new Date()).getTime();

  return (
    <div class="mx-auto flex w-full flex-col gap-4 md:max-w-xl">
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

      {botdEntries.map((bookOfTheDay) => (
        <section class="flex flex-col gap-3 mt-4 border-t border-outline pt-4">
          <SpotlightCard
            href={bookPath(bookOfTheDay.book.slug)}
            imageUrl={bookOfTheDay.book.coverUrl ?? ""}
            imageAlt={bookOfTheDay.book.title}
            dateLabel={toDateString(bookOfTheDay.date)}
            kicker="Book of the Day"
            title={bookOfTheDay.book.title}
            subtitle={bookOfTheDay.book.artist?.displayName}
            className="w-full max-w-none"
          />
          <SpotlightBlurb text={bookOfTheDay.spotlightBlurb} />
        </section>
      ))}

      {artistOfTheWeek || publisherOfTheWeek ? (
        <section
          class={`mt-4 grid gap-4 border-t border-outline pt-4 ${
            artistOfTheWeek && publisherOfTheWeek
              ? "grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {artistOfTheWeek ? (
            <div class="flex min-w-0 flex-col gap-3">
              <SpotlightCard
                href={creatorPath(artistOfTheWeek.creator.slug)}
                imageUrl={
                  artistOfTheWeek.featuredImageUrl ??
                  artistOfTheWeek.creator.coverUrl ??
                  ""
                }
                imageAlt={artistOfTheWeek.creator.displayName}
                kicker="Artist of the Week"
                title={artistOfTheWeek.creator.displayName}
                subtitle={artistOfTheWeek.creator.city ?? undefined}
                className="w-full max-w-none"
              />
              <SpotlightBlurb text={artistOfTheWeek.spotlightBlurb} />
            </div>
          ) : null}
          {publisherOfTheWeek ? (
            <div class="flex min-w-0 flex-col gap-3">
              <SpotlightCard
                href={creatorPath(publisherOfTheWeek.creator.slug)}
                imageUrl={
                  publisherOfTheWeek.featuredImageUrl ??
                  publisherOfTheWeek.creator.coverUrl ??
                  ""
                }
                imageAlt={publisherOfTheWeek.creator.displayName}
                kicker="Publisher of the Week"
                title={publisherOfTheWeek.creator.displayName}
                subtitle={publisherOfTheWeek.creator.city ?? undefined}
                className="w-full max-w-none"
              />
              <SpotlightBlurb text={publisherOfTheWeek.spotlightBlurb} />
            </div>
          ) : null}
        </section>
      ) : null}

      {trending.books.length > 0 ? (
        <WeekGrid kicker="Trending" title="Top books this week">
          {trending.books.map((book) => (
            <SpotlightCard
              href={bookPath(book.bookSlug)}
              imageUrl={book.coverUrl ?? ""}
              imageAlt={book.title}
              title={book.title}
              subtitle={book.artistName ?? undefined}
              className="min-w-0 w-full max-w-none"
            />
          ))}
        </WeekGrid>
      ) : null}

      {trending.artists.length > 0 ? (
        <WeekGrid kicker="Trending" title="Top artists this week">
          {trending.artists.map((artist) => (
            <SpotlightCard
              href={creatorPath(artist.slug)}
              imageUrl={artist.coverUrl ?? ""}
              imageAlt={artist.displayName}
              title={artist.displayName}
              aspectSquare
              className="min-w-0 w-full max-w-none"
            />
          ))}
        </WeekGrid>
      ) : null}

      {trending.publishers.length > 0 ? (
        <WeekGrid kicker="Trending" title="Top publishers this week">
          {trending.publishers.map((publisher) => (
            <SpotlightCard
              href={creatorPath(publisher.slug)}
              imageUrl={publisher.coverUrl ?? ""}
              imageAlt={publisher.displayName}
              title={publisher.displayName}
              aspectSquare
              className="min-w-0 w-full max-w-none"
            />
          ))}
        </WeekGrid>
      ) : null}

      {newMembers.length > 0 ? (
        <WeekGrid kicker="Discover" title="New on Photobookers">
          {newMembers.map((member) => (
            <SpotlightCard
              href={creatorPath(member.slug)}
              imageUrl={member.coverUrl ?? ""}
              imageAlt={member.displayName}
              title={member.displayName}
              subtitle={member.location ?? member.tagline ?? undefined}
              aspectSquare
              className="min-w-0 w-full max-w-none"
            />
          ))}
        </WeekGrid>
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

const SpotlightBlurb = ({ text }: { text?: string | null }) => {
  const copy = resolveSpotlightCopy(text);
  if (!copy) return null;
  return <ExpandableDescription text={copy} />;
};

const WeekGrid = ({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ChildType;
}) => (
  <section class="flex flex-col items-center gap-4 mt-4 border-t border-outline pt-4">
    <SectionTitle kicker={kicker}>{title}</SectionTitle>
    <div class="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
  </section>
);

export default ThisWeekDetail;
