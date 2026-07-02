import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getNewsletterSignupsDashboard } from "../../../../newsletter-analytics/signups";
import NewsletterAnalyticsOverviewSection from "./NewsletterAnalyticsOverviewSection";
import { newsletterAnalyticsDisclaimer } from "./newsletterAnalyticsShared";
import NewsletterAnalyticsTrendSection from "./NewsletterAnalyticsTrendSection";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const NewsletterAnalyticsBlock = async ({ dateRange }: Props) => {
  const [error, data] = await getNewsletterSignupsDashboard(dateRange);

  return (
    <div class="flex flex-col gap-12">
      <p class="text-sm text-on-surface">{newsletterAnalyticsDisclaimer}</p>

      {error ? (
        <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
          {error.reason}
        </div>
      ) : (
        <>
          <NewsletterAnalyticsOverviewSection data={data} dateRange={dateRange} />
          <NewsletterAnalyticsTrendSection data={data} dateRange={dateRange} />
        </>
      )}
    </div>
  );
};

export default NewsletterAnalyticsBlock;
