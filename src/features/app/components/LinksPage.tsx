import SpotlightCard from "../../../components/app/SpotlightCard";
import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import { formatCountry } from "../../../lib/utils";
import { BookOfTheDayWithBook } from "../BOTDServices";
import { ArtistOfTheWeekWithCreator } from "../AOTWServices";
import { PublisherOfTheWeekWithCreator } from "../POTWServices";
import { aotwPath, botdPath, potwPath } from "../spotlightUrls";
import { formatDate } from "../../../utils";

type Props = {
  bookOfTheDay: BookOfTheDayWithBook | null;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const cardClassName = "w-full max-w-none";

const LinksPage = ({
  bookOfTheDay,
  artistOfTheWeek,
  publisherOfTheWeek,
}: Props) => {
  const hasContent = bookOfTheDay || artistOfTheWeek || publisherOfTheWeek;

  return (
    <div class="mx-auto flex w-full max-w-md flex-col gap-8">
      <header class="flex flex-col items-center gap-2 border-b-2 border-t-2 border-on-surface-strong py-6 text-center">
        <a
          href="/featured"
          class="kicker text-accent transition-opacity hover:opacity-80"
        >
          Photobookers
        </a>
        <h1 class="text-balance font-display text-2xl font-medium leading-tight text-on-surface-strong">
          This week&apos;s highlights
        </h1>
        <p class="text-pretty text-sm text-on-surface">
          Today&apos;s pick and this week&apos;s featured artist and publisher.
        </p>
      </header>

      {!hasContent ? (
        <p class="text-center text-sm text-on-surface">
          Nothing featured right now.{" "}
          <a
            href="/featured"
            class="underline decoration-accent underline-offset-4 hover:text-accent"
          >
            Explore Photobookers
          </a>
        </p>
      ) : null}

      {bookOfTheDay ? (
        <section class="flex flex-col gap-4">
          <SectionTitle>Book of the Day</SectionTitle>
          <SpotlightCard
            href={botdPath(bookOfTheDay.date)}
            imageUrl={bookOfTheDay.book.coverUrl ?? ""}
            imageAlt={bookOfTheDay.book.title}
            dateLabel={formatDate(bookOfTheDay.date)}
            title={bookOfTheDay.book.title}
            subtitle={bookOfTheDay.book.artist?.displayName}
            className={cardClassName}
          />
        </section>
      ) : null}

      {artistOfTheWeek ? (
        <section class="flex flex-col gap-4">
          <SectionTitle>Artist of the Week</SectionTitle>
          <SpotlightCard
            href={aotwPath(artistOfTheWeek.weekStart)}
            imageUrl={
              artistOfTheWeek.instagramImageUrl ??
              artistOfTheWeek.creator.coverUrl ??
              ""
            }
            imageAlt={artistOfTheWeek.creator.displayName}
            dateLabel={`Week of ${formatDate(artistOfTheWeek.weekStart)}`}
            title={artistOfTheWeek.creator.displayName}
            subtitle={
              [
                artistOfTheWeek.creator.city,
                formatCountry(artistOfTheWeek.creator.country ?? ""),
              ]
                .filter(Boolean)
                .join(", ") || undefined
            }
            aspectSquare
            className={cardClassName}
          />
        </section>
      ) : null}

      {publisherOfTheWeek ? (
        <section class="flex flex-col gap-4">
          <SectionTitle>Publisher of the Week</SectionTitle>
          <SpotlightCard
            href={potwPath(publisherOfTheWeek.weekStart)}
            imageUrl={
              publisherOfTheWeek.instagramImageUrl ??
              publisherOfTheWeek.creator.coverUrl ??
              ""
            }
            imageAlt={publisherOfTheWeek.creator.displayName}
            dateLabel={`Week of ${formatDate(publisherOfTheWeek.weekStart)}`}
            title={publisherOfTheWeek.creator.displayName}
            subtitle={
              [
                publisherOfTheWeek.creator.city,
                formatCountry(publisherOfTheWeek.creator.country ?? ""),
              ]
                .filter(Boolean)
                .join(", ") || undefined
            }
            aspectSquare
            className={cardClassName}
          />
        </section>
      ) : null}

      <div class="flex justify-center pt-2">
        <a href="/featured">
          <Button variant="solid" color="primary" width="md">
            Visit Photobookers
          </Button>
        </a>
      </div>
    </div>
  );
};

export default LinksPage;
