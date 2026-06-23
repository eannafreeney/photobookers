import { BookFair } from "../../../../db/schema";
import Link from "../../../../components/app/Link";
import { fairUrl } from "../../spotlightUrls";

type FairsNewsletterBlockProps = {
  fairs: Array<
    Pick<
      BookFair,
      | "id"
      | "slug"
      | "name"
      | "startDate"
      | "endDate"
      | "city"
      | "country"
      | "venue"
      | "website"
      | "coverUrl"
    >
  >;
  title?: string;
  limit?: number;
};

const FairsNewsletterBlock = ({
  fairs,
  title = "Upcoming Photobook Fairs",
  limit = 5,
}: FairsNewsletterBlockProps) => {
  const displayFairs = fairs.slice(0, limit);

  if (displayFairs.length === 0) {
    return null;
  }

  const formatDateRange = (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Same day
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // Same month
    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}–${endDate.toLocaleDateString("en-US", {
        day: "numeric",
        year: "numeric",
      })}`;
    }

    // Different months
    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} – ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <div class="border-2 border-on-surface-strong rounded p-6 bg-surface-container-low">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-display font-medium text-on-surface-strong">
          {title}
        </h3>
        <Link
          href="/fairs"
          className="text-sm text-accent hover:underline underline-offset-4"
        >
          View all →
        </Link>
      </div>

      <div class="flex flex-col gap-4">
        {displayFairs.map((fair) => {
          const location =
            fair.city && fair.country
              ? `${fair.city}, ${fair.country}`
              : fair.city || fair.country || null;

          return (
            <div
              key={fair.id}
              class="flex gap-4 pb-4 border-b border-outline last:border-0 last:pb-0"
            >
              {fair.coverUrl && (
                <Link
                  href={fairUrl(fair.slug)}
                  className="flex-shrink-0 block"
                >
                  <img
                    src={fair.coverUrl}
                    alt={fair.name}
                    class="w-20 h-20 object-cover rounded border border-outline"
                  />
                </Link>
              )}
              <div class="flex-1 min-w-0">
                <Link
                  href={fairUrl(fair.slug)}
                  className="font-medium text-on-surface-strong hover:text-accent transition-colors line-clamp-2"
                >
                  {fair.name}
                </Link>
                <div class="mt-1 text-sm text-on-surface-muted">
                  {formatDateRange(fair.startDate, fair.endDate)}
                </div>
                {location && (
                  <div class="mt-0.5 text-sm text-on-surface-muted">
                    {location}
                  </div>
                )}
                {fair.website && (
                  <a
                    href={fair.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-1 inline-block text-xs text-accent hover:underline underline-offset-4"
                  >
                    Fair website →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FairsNewsletterBlock;
