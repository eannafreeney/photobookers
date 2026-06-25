import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import { getPublishedStores } from "../../../features/app/stores/services";
import StoresGrid from "../../../features/app/stores/components/StoresGrid";
import Button from "../../../components/app/Button";
import { isFeatureEnabled } from "../../../lib/features";
import StoresSlider from "../../../features/app/stores/components/StoresSlider";

const FEATURED_STORES_LIMIT = 5;

export const GET = createRoute(async (c) => {
  if (!isFeatureEnabled("stores")) return c.html(<></>);

  const [error, result] = await getPublishedStores({
    page: 1,
    limit: FEATURED_STORES_LIMIT,
  });

  if (error) return c.html(<></>);

  const { stores } = result;
  if (stores.length === 0) return c.html(<></>);

  return c.html(
    <div id="stores-fragment">
      <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
        <SectionTitle className="mb-0" kicker="Shop Local">
          Bookstores
        </SectionTitle>
        <ViewAllLink href="/stores" />
      </div>
      <div class="sm:hidden">
        <StoresSlider stores={stores} />
      </div>
      <div class="hidden sm:block">
        <StoresGrid
          stores={stores}
          page={1}
          totalPages={1}
          baseUrl="/stores"
          targetId="stores-fragment-grid"
        />
      </div>
      <div class=" mt-8 flex md:hidden justify-center">
        <a href="/stores">
          <Button variant="solid" color="primary" width="xl">
            View All Bookstores →
          </Button>
        </a>
      </div>
    </div>,
  );
});
