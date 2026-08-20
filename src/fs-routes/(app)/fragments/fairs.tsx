import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import {
  getUpcomingFairs,
  getCurrentFairs,
} from "../../../features/app/fairs/services";
import FairsTimeline from "../../../features/app/fairs/components/FairsTimeline";
import Button from "../../../components/app/Button";

const FEATURED_FAIRS_LIMIT = 5;

export const GET = createRoute(async (c) => {
  const [[upcomingError, upcomingFairs], [currentError, currentFairs]] =
    await Promise.all([
      getUpcomingFairs(1, FEATURED_FAIRS_LIMIT),
      getCurrentFairs(1, FEATURED_FAIRS_LIMIT),
    ]);

  if (upcomingError || currentError) return c.html(<></>);

  // Combine fairs, prioritizing current fairs first (dedupe in case of overlap)
  const seen = new Set<string>();
  const allFairs = [
    ...(currentFairs?.fairs ?? []),
    ...(upcomingFairs?.fairs ?? []),
  ]
    .filter((fair) => {
      if (seen.has(fair.id)) return false;
      seen.add(fair.id);
      return true;
    })
    .slice(0, FEATURED_FAIRS_LIMIT);

  // If no fairs available, don't render anything
  if (allFairs.length === 0) return c.html(<></>);

  return c.html(
    <div id="fairs-fragment">
      <SectionHeader kicker="Days Out!" action={<ViewAllLink href="/fairs" />}>
        Book Fairs
      </SectionHeader>
      <FairsTimeline fairs={allFairs} />
      <div class="mt-8 flex md:hidden justify-center">
        <a href="/fairs">
          <Button variant="solid" color="primary" width="xl">
            View All Fairs →
          </Button>
        </a>
      </div>
    </div>,
  );
});
