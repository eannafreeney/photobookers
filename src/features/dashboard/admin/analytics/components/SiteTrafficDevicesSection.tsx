import type { SiteTrafficDataProps } from "./siteTrafficShared";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard";
import SectionTitle from "../../../../../components/app/SectionTitle";

const SiteTrafficDevicesSection = ({ data }: SiteTrafficDataProps) => {
  const { devices } = data;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Devices</SectionTitle>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnalyticsStatCard label="Mobile sessions" value={devices.mobile} />
        <AnalyticsStatCard label="Desktop sessions" value={devices.desktop} />
        <AnalyticsStatCard label="Tablet sessions" value={devices.tablet} />
      </div>
    </div>
  );
};

export default SiteTrafficDevicesSection;
