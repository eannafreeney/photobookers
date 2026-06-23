import { BookFair } from "../../../../db/schema";
import { fairUrl } from "../../spotlightUrls";
import Link from "../../../../components/app/Link";

type UpcomingFairsSectionProps = {
  fairs: Array<
    Pick<
      BookFair,
      "id" | "slug" | "name" | "startDate" | "endDate" | "city" | "country"
    >
  >;
  emptyMessage?: string;
};

const UpcomingFairsSection = ({
  fairs,
  emptyMessage = "No upcoming fairs",
}: UpcomingFairsSectionProps) => {
  if (fairs.length === 0) {
    return (
      <div class="text-sm text-on-surface-muted italic">{emptyMessage}</div>
    );
  }

  return (
    <div class="flex flex-col gap-3">
      {fairs.map((fair) => (
        <FairItem key={fair.id} fair={fair} />
      ))}
    </div>
  );
};

export default UpcomingFairsSection;

type FairItemProps = {
  fair: Pick<
    BookFair,
    "slug" | "name" | "startDate" | "endDate" | "city" | "country"
  >;
};

const FairItem = ({ fair }: FairItemProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Same day
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate);
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
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  };

  const location =
    fair.city && fair.country
      ? `${fair.city}, ${fair.country}`
      : fair.city || fair.country || null;

  return (
    <Link
      href={fairUrl(fair.slug)}
      className="block group hover:bg-surface-container-low transition-colors p-2 -mx-2 rounded"
    >
      <div class="flex flex-col gap-0.5">
        <div class="text-sm font-medium text-on-surface-strong group-hover:text-accent transition-colors">
          {fair.name}
        </div>
        <div class="text-xs text-on-surface-muted">
          {formatDateRange(fair.startDate, fair.endDate)}
        </div>
        {location && (
          <div class="text-xs text-on-surface-muted">{location}</div>
        )}
      </div>
    </Link>
  );
};
