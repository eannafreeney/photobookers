import type { BookFair } from "../../../../db/schema";
import Tabs from "../../../../components/app/Tabs";
import FairsGrid from "./FairsGrid";

type FairsWithTabsProps = {
  tab: "upcoming" | "current" | "past";
  upcomingFairs?: BookFair[];
  upcomingPage?: number;
  upcomingTotalPages?: number;
  currentFairs?: BookFair[];
  currentPage?: number;
  currentTotalPages?: number;
  pastFairs?: BookFair[];
  pastPage?: number;
  pastTotalPages?: number;
  baseUrl: string;
};

const FairsWithTabs = ({
  tab,
  upcomingFairs = [],
  upcomingPage = 1,
  upcomingTotalPages = 1,
  currentFairs = [],
  currentPage = 1,
  currentTotalPages = 1,
  pastFairs = [],
  pastPage = 1,
  pastTotalPages = 1,
  baseUrl,
}: FairsWithTabsProps) => {
  return (
    <Tabs defaultTab={tab}>
      <Tabs.LinkContainer>
        <Tabs.Link tabId="upcoming">Upcoming</Tabs.Link>
        <Tabs.Link tabId="current">Happening Now</Tabs.Link>
        <Tabs.Link tabId="past">Past</Tabs.Link>
      </Tabs.LinkContainer>
      <Tabs.Panel tabId="upcoming">
        <FairsGrid
          fairs={upcomingFairs}
          page={upcomingPage}
          totalPages={upcomingTotalPages}
          baseUrl={`${baseUrl}?tab=upcoming`}
          targetId="upcoming-fairs-grid"
        />
      </Tabs.Panel>
      <Tabs.Panel tabId="current">
        <FairsGrid
          fairs={currentFairs}
          page={currentPage}
          totalPages={currentTotalPages}
          baseUrl={`${baseUrl}?tab=current`}
          targetId="current-fairs-grid"
        />
      </Tabs.Panel>
      <Tabs.Panel tabId="past">
        <FairsGrid
          fairs={pastFairs}
          page={pastPage}
          totalPages={pastTotalPages}
          baseUrl={`${baseUrl}?tab=past`}
          targetId="past-fairs-grid"
        />
      </Tabs.Panel>
    </Tabs>
  );
};

export default FairsWithTabs;
