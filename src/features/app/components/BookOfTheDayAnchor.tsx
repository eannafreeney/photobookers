import type { AuthUser } from "../../../../types";
import SaveToListButton from "../../api/components/SaveToListButton";
import Button from "../../../components/app/Button";
import { formatDateWithoutYear } from "../../../utils";
import { botdIndexPath, botdPath } from "../spotlightUrls";
import { heroLcpImageSources } from "../../../lib/imageUrl";
import type { BookOfTheDayWithBook } from "../BOTDServices";

type Props = {
  user: AuthUser | null;
  today: BookOfTheDayWithBook;
  yesterday?: BookOfTheDayWithBook | null;
  twoDaysAgo?: BookOfTheDayWithBook | null;
  threeDaysAgo?: BookOfTheDayWithBook | null;
};

const heroImage = (entry: BookOfTheDayWithBook) =>
  entry.featuredImageUrl ??
  entry.book.coverUrl ??
  entry.book.images?.[0]?.imageUrl ??
  "";

/**
 * The daily hook, out of the rotating hero and into a dated block of its own:
 * today's pick, yesterday's for a reason to have come back, and the archive.
 */
const BookOfTheDayAnchor = ({
  today,
  yesterday,
  twoDaysAgo,
  threeDaysAgo,
  user,
}: Props) => {
  const book = today.book;
  const link = botdPath(today.date);
  const image = heroImage(today);
  // Opens the page, so this is the LCP element: eager, sized, high priority.
  const sources = image ? heroLcpImageSources(image) : null;

  const previousDays = [yesterday, twoDaysAgo, threeDaysAgo].filter(
    (entry): entry is BookOfTheDayWithBook => Boolean(entry),
  );

  return (
    <section>
      <div class="flex flex-col md:flex-row gap-6 pb-8 items-center justify-center md:gap-12 md:py-14">
        <a
          href={link}
          class="flex h-[340px] justify-center md:h-[440px] md:justify-end"
        >
          <img
            src={sources?.src ?? image}
            srcset={sources?.srcSet}
            sizes={sources?.sizes}
            alt={book.title}
            width={600}
            height={800}
            fetchpriority="high"
            class="h-full w-auto max-w-full object-contain shadow-sm"
          />
        </a>

        <div class="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <span class="kicker text-accent">
            Book of the Day · {formatDateWithoutYear(today.date)}
          </span>
          <h1 class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance md:text-5xl">
            <a href={link}>{book.title}</a>
          </h1>
          {book.artist ? (
            <p class="text-sm text-on-surface md:text-base">
              by{" "}
              <a
                href={`/creators/${book.artist.slug}`}
                class="underline decoration-accent underline-offset-4 hover:text-accent transition-colors"
              >
                {book.artist.displayName}
              </a>
            </p>
          ) : null}

          <div class="mt-1 flex items-center gap-3">
            <a href={link} class="group">
              <Button variant="solid" color="primary" width="lg">
                <span class="inline-flex items-center">
                  Read today's pick
                  <span class="w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-6 group-hover:opacity-100">
                    &nbsp;→
                  </span>
                </span>
              </Button>
            </a>
            <div class="w-32">
              <SaveToListButton book={book} user={user} variant="button" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-6 border-t border-outline py-3">
        <div class="flex flex-wrap items-center gap-6">
          {previousDays.length > 0 &&
            previousDays.map((day) => (
              <a
                href={botdPath(day.date)}
                class="group flex min-w-0 items-center gap-3"
              >
                <span class="kicker text-on-surface-weak shrink-0">
                  {formatDateWithoutYear(day.date)}
                </span>
                <img
                  src={heroImage(day)}
                  alt=""
                  class="h-10 w-8 shrink-0 object-cover"
                  loading="lazy"
                />
                <span class="min-w-0 truncate text-sm text-on-surface-strong group-hover:underline decoration-accent underline-offset-4">
                  {day.book.title}
                </span>
              </a>
            ))}
        </div>
        <div>
          <a
            href={botdIndexPath()}
            class="kicker text-on-surface-weak transition-colors hover:text-on-surface-strong"
          >
            Browse every pick →
          </a>
        </div>
      </div>
    </section>
  );
};

export default BookOfTheDayAnchor;
