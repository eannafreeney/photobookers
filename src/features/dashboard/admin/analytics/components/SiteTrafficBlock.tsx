import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import { getSiteTrafficDashboard } from "../../../../site-analytics/siteTraffic";
import SiteTrafficAcquisitionTable from "./SiteTrafficAcquisitionTable";
import SiteTrafficCampaignsTable from "./SiteTrafficCampaignsTable";
import SiteTrafficDevicesSection from "./SiteTrafficDevicesSection";
import SiteTrafficGeographyTable from "./SiteTrafficGeographyTable";
import SiteTrafficLandingPagesTable from "./SiteTrafficLandingPagesTable";
import SiteTrafficOverviewSection from "./SiteTrafficOverviewSection";
import SiteTrafficReferrersTable from "./SiteTrafficReferrersTable";
import { siteTrafficDisclaimer } from "./siteTrafficShared";
import SiteTrafficTopPagesTable from "./SiteTrafficTopPagesTable";
import SiteTrafficTrendSection from "./SiteTrafficTrendSection";

type Props = {
  dateRange: AnalyticsDateRange | null;
};

const SiteTrafficBlock = async ({ dateRange }: Props) => {
  const [error, data] = await getSiteTrafficDashboard(dateRange);

  return (
    <div class="flex flex-col gap-12">
      <p class="text-sm text-on-surface">{siteTrafficDisclaimer}</p>

      {error ? (
        <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
          {error.reason}
        </div>
      ) : (
        <>
          <SiteTrafficOverviewSection data={data} dateRange={dateRange} />
          <SiteTrafficTrendSection data={data} dateRange={dateRange} />
          <SiteTrafficDevicesSection data={data} />
          <SiteTrafficAcquisitionTable data={data} />
          <SiteTrafficReferrersTable data={data} />
          <SiteTrafficLandingPagesTable data={data} />
          <SiteTrafficTopPagesTable data={data} />
          <SiteTrafficGeographyTable data={data} />
          <SiteTrafficCampaignsTable data={data} />
        </>
      )}
    </div>
  );
};

export default SiteTrafficBlock;
