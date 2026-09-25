import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import { getPublishedStores } from "../../../features/app/stores/services";
import Button from "../../../components/app/Button";
import EntityColumns from "../../../components/app/EntityColumns";

const FEATURED_STORES_LIMIT = 9;

export const GET = createRoute(async (c) => {
  const [error, result] = await getPublishedStores({
    page: 1,
    limit: FEATURED_STORES_LIMIT,
  });

  if (error) return c.html(<></>);

  const { stores } = result;
  if (stores.length === 0) return c.html(<></>);

  return c.html(
    <div id="stores-fragment">
      <SectionHeader
        kicker="Shop Local"
        action={<ViewAllLink href="/stores" />}
      >
        Bookstores
      </SectionHeader>
      <EntityColumns entities={stores} hrefBase="/stores" />
      <div class="mt-8 flex justify-center">
        <a href="/stores">
          <Button variant="solid" color="primary" width="xl">
            View All Bookstores →
          </Button>
        </a>
      </div>
    </div>,
  );
});
