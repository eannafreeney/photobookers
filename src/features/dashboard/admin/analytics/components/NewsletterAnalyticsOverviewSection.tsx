import Button from "../../../../../components/app/Button";
import {
  formatAnalyticsDateRangeLabel,
  type AnalyticsDateRange,
} from "../../../../book-analytics/dateRange";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard";
import type { NewsletterAnalyticsDataProps } from "./newsletterAnalyticsShared";

type Props = NewsletterAnalyticsDataProps & {
  dateRange: AnalyticsDateRange | null;
};

const NewsletterAnalyticsOverviewSection = ({ data, dateRange }: Props) => {
  const periodLabel = formatAnalyticsDateRangeLabel(dateRange);
  const periodCopy = data.usesDefaultRange
    ? "Showing newsletter signups for the last 30 days"
    : `Showing newsletter signups for ${periodLabel}`;

  return (
    <div class="flex flex-col gap-4">
      <p class="text-sm text-on-surface">{periodCopy}</p>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnalyticsStatCard
          label="Total subscribers"
          value={data.totalSubscribers}
        />
        <AnalyticsStatCard
          label="New signups in period"
          value={data.overview.signupsInPeriod}
        />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <a
          href={data.brevoListUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" color="primary" width="auto">
            Open {data.listName} in Brevo
          </Button>
        </a>
        <p class="text-sm text-on-surface">
          View full list details, unsubscribes, and campaign stats in Brevo.
        </p>
      </div>
    </div>
  );
};

export default NewsletterAnalyticsOverviewSection;
