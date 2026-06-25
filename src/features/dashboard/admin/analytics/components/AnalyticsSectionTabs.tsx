import Pill from "../../../../../components/app/Pill";
import type { AnalyticsDateRange } from "../../../../book-analytics/dateRange";
import {
  ADMIN_ANALYTICS_PANEL_ID,
  adminAnalyticsHref,
} from "../adminAnalyticsPanel";

export type AnalyticsSectionTab = "books" | "site" | "app";

export function parseAnalyticsSectionTab(raw?: string): AnalyticsSectionTab {
  return raw === "site" ? "site" : raw === "app" ? "app" : "books";
}

type Props = {
  activeTab: AnalyticsSectionTab;
  dateRange: AnalyticsDateRange | null;
};

const TABS: { id: AnalyticsSectionTab; label: string }[] = [
  { id: "books", label: "Book analytics" },
  { id: "site", label: "Site analytics" },
  { id: "app", label: "App analytics" },
];

const pillButtonClass =
  "cursor-pointer border-0 bg-transparent p-0 font-inherit";

const AnalyticsSectionTabs = ({ activeTab, dateRange }: Props) => {
  return (
    <div class="flex flex-wrap items-center justify-center gap-2">
      {TABS.map((tab) => (
        <a
          key={tab.id}
          href={adminAnalyticsHref(dateRange, {
            tab: tab.id,
            fragment: true,
          })}
          x-target={ADMIN_ANALYTICS_PANEL_ID}
          prefetch="intent"
          aria-current={activeTab === tab.id ? "page" : undefined}
          class={pillButtonClass}
        >
          <Pill variant={activeTab === tab.id ? "inverse" : "default"}>
            {tab.label}
          </Pill>
        </a>
      ))}
    </div>
  );
};

export default AnalyticsSectionTabs;
