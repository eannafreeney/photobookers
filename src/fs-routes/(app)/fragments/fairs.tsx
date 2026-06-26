import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import {
  getUpcomingFairs,
  getCurrentFairs,
} from "../../../features/app/fairs/services";
import FairsSlider from "../../../features/app/fairs/components/FairsSlider";
import FairsGrid from "../../../features/app/fairs/components/FairsGrid";
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
      <div class="mb-6 mt-12 border-t-2 border-on-surface-strong pt-3">
        <div class="mr-6 flex items-end justify-between">
          <SectionTitle className="mb-0" kicker="Days Out!">
            Book Fairs
          </SectionTitle>
          <ViewAllLink href="/fairs" />
        </div>
      </div>
      <div class="sm:hidden">
        <FairsSlider fairs={allFairs} />
      </div>
      <div class="hidden sm:block">
        <FairsGrid
          fairs={allFairs}
          page={1}
          totalPages={1}
          baseUrl="/fairs"
          targetId="fairs-fragment-grid"
        />
      </div>
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
