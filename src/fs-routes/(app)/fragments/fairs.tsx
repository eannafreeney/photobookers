import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import {
  getUpcomingFairs,
  getCurrentFairs,
} from "../../../features/app/fairs/services";
import FairsGrid from "../../../features/app/fairs/components/FairsGrid";
import Button from "../../../components/app/Button";

const FEATURED_FAIRS_LIMIT = 5;

export const GET = createRoute(async (c) => {
  // Fetch both upcoming and current fairs
  const [upcomingError, upcomingResult] = await getUpcomingFairs(
    1,
    FEATURED_FAIRS_LIMIT,
  );
  const [currentError, currentResult] = await getCurrentFairs(
    1,
    FEATURED_FAIRS_LIMIT,
  );

  // Combine fairs, prioritizing current fairs first
  const allFairs = [
    ...(currentResult?.fairs ?? []),
    ...(upcomingResult?.fairs ?? []),
  ].slice(0, FEATURED_FAIRS_LIMIT);

  // If no fairs available, don't render anything
  if (allFairs.length === 0) return c.html(<></>);

  return c.html(
    <div id="fairs-fragment">
      <div class="border-t-2 border-on-surface-strong pt-3 mb-3 mt-10">
        <SectionTitle className="mb-0" kicker="Days Out!">
          Featured Fairs
        </SectionTitle>
      </div>
      <FairsGrid
        fairs={allFairs}
        page={1}
        totalPages={1}
        baseUrl="/fairs"
        targetId="fairs-fragment-grid"
        isPaginated={false}
      />
      <div class="flex justify-center mt-8">
        <a href="/fairs">
          <Button variant="solid" color="primary" width="xl">
            View All Fairs →
          </Button>
        </a>
      </div>
    </div>,
  );
});
