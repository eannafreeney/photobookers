import type { BookFair } from "../../../../db/schema";
import { formatCountry } from "../../../../lib/utils";
import { formatFairDateRange, isFairRunning } from "../fairDateRange";

type Props = {
  fairs: BookFair[];
};

const place = (fair: BookFair) =>
  [fair.city, fair.country ? formatCountry(fair.country) : null]
    .filter(Boolean)
    .join(", ");

/**
 * Dated rows rather than another card strip — fairs are a calendar, so the
 * date does the work and the eye can scan down it.
 */
const FairsTimeline = ({ fairs }: Props) => {
  const now = new Date();

  return (
    <ol class="flex flex-col">
      {fairs.map((fair) => {
        const range = formatFairDateRange(fair.startDate, fair.endDate);
        const running = isFairRunning(fair.startDate, fair.endDate, now);

        return (
          <li key={fair.id} class="border-t border-outline first:border-t-0">
            <a
              href={`/fairs/${fair.slug}`}
              class="group flex items-center gap-4 py-4 transition-colors hover:bg-surface-alt/50 sm:gap-6"
            >
              <span class="flex w-24 shrink-0 flex-col items-start sm:w-28">
                {range.month ? (
                  <span class="kicker text-accent">{range.month}</span>
                ) : null}
                <span class="font-display text-xl font-medium leading-tight text-on-surface-strong tabular-nums sm:text-2xl">
                  {range.days}
                </span>
              </span>

              {fair.coverUrl ? (
                <span class="flex flex-col gap-0.5">
                  <img
                    src={fair.coverUrl}
                    alt={fair.name}
                    class="w-10 h-10 object-cover rounded-radius"
                  />
                </span>
              ) : null}

              <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="flex flex-wrap items-center gap-2">
                  <span class="font-medium text-on-surface-strong group-hover:underline decoration-accent underline-offset-4">
                    {fair.name}
                  </span>
                  {running ? (
                    <span class="kicker rounded-radius bg-accent px-1.5 py-0.5 text-on-accent">
                      On now
                    </span>
                  ) : null}
                </span>
                {(place(fair) || fair.venue) && (
                  <span class="truncate text-sm text-on-surface-weak">
                    {[fair.venue, place(fair)].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>

              <span class="kicker hidden shrink-0 text-on-surface-weak transition-colors group-hover:text-on-surface-strong sm:inline">
                Details →
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
};

export default FairsTimeline;
