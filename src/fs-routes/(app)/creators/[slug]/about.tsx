import { paramValidator } from "../../../../lib/validator";
import { createRoute } from "hono-fsr";
import { slugSchema } from "../../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import { getCreatorAboutBySlug } from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import MobileCreatorCard from "../../../../components/app/MobileCreatorCard";
import CreatorNavTabs from "../../../../features/app/components/CreatorNavTabs";
import CreatorCard from "../../../../components/app/CreatorCard";
import RelatedCreators from "../../../../features/app/components/RelatedCreators";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;

    const [error, result] = await getCreatorAboutBySlug(slug);

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

    const { creator, relatedCreators } = result;

    return c.html(
      <AppLayout
        title={creator?.displayName ?? ""}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/creators/${creator.id}/update`}
      >
        <Page>
          <div class="flex flex-col gap-4">
            <MobileCreatorCard creator={creator} user={user} />
            <CreatorNavTabs
              showCreatorsTab={relatedCreators.length > 0}
              creator={creator}
              currentPath={currentPath}
            />
            <CreatorCard
              creator={creator}
              currentPath={currentPath}
              user={user}
              title=""
            />
            <RelatedCreators
              creators={relatedCreators}
              title="You may also like..."
            />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
