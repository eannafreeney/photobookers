import SpotlightCard from "../../../components/app/SpotlightCard";
import SectionTitle from "../../../components/app/SectionTitle";
import Button from "../../../components/app/Button";
import { SITE_APP, SITE_SOCIAL } from "../../../constants/siteSocial";
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
  newlyVerifiedCreators: Array<{
    id: string;
    slug: string;
    displayName: string;
    type: "artist" | "publisher";
  }>;
};

const cardClassName = "w-full max-w-none";

const pageLinks = [
  { href: SITE_APP.ios.href, label: "Download the app", external: true },
  { href: "/newsletter", label: "Join the newsletter" },
] as const;

const LinksPage = ({
  bookOfTheDay,
  artistOfTheWeek,
  publisherOfTheWeek,
  newlyVerifiedCreators,
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

      <nav class="flex w-full flex-col gap-3" aria-label="Explore Photobookers">
        {pageLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={"external" in link && link.external ? "_blank" : undefined}
            class="w-full"
          >
            <Button variant="outline" color="primary" width="full">
              {link.label}
            </Button>
          </a>
        ))}
      </nav>

      {bookOfTheDay ? (
        <section class="flex flex-col items-center gap-4">
          <SectionTitle>Book of the Day</SectionTitle>
          <SpotlightCard
            href={botdPath(bookOfTheDay.date)}
            imageUrl={bookOfTheDay.book.coverUrl ?? ""}
            imageAlt={bookOfTheDay.book.title}
            title={bookOfTheDay.book.title}
            subtitle={bookOfTheDay.book.artist?.displayName}
            className={cardClassName}
          />
        </section>
      ) : null}

      {artistOfTheWeek ? (
        <section class="flex flex-col items-center gap-4">
          <SectionTitle>Artist of the Week</SectionTitle>
          <SpotlightCard
            href={aotwPath(artistOfTheWeek.weekStart)}
            imageUrl={
              artistOfTheWeek.featuredImageUrl ??
              artistOfTheWeek.creator.coverUrl ??
              ""
            }
            imageAlt={artistOfTheWeek.creator.displayName}
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
        <section class="flex flex-col items-center gap-4">
          <SectionTitle>Publisher of the Week</SectionTitle>
          <SpotlightCard
            href={potwPath(publisherOfTheWeek.weekStart)}
            imageUrl={
              publisherOfTheWeek.featuredImageUrl ??
              publisherOfTheWeek.creator.coverUrl ??
              ""
            }
            imageAlt={publisherOfTheWeek.creator.displayName}
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

      {newlyVerifiedCreators.length > 0 ? (
        <section class="flex w-full flex-col items-center gap-4">
          <SectionTitle>New on photobookers</SectionTitle>
          <nav
            class="flex w-full flex-col gap-3"
            aria-label="New on photobookers"
          >
            {newlyVerifiedCreators.map((creator) => (
              <a
                key={creator.id}
                href={`/creators/${creator.slug}`}
                class="w-full"
              >
                <Button variant="outline" color="primary" width="full">
                  {creator.displayName}
                </Button>
              </a>
            ))}
          </nav>
        </section>
      ) : null}

      <a href="/featured" class="mx-auto">
        <Button variant="outline" color="primary" width="auto">
          Visit Photobookers
        </Button>
      </a>
    </div>
  );
};

export default LinksPage;
