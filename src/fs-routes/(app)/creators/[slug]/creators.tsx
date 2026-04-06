import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { slugSchema } from "../../../../features/app/schema";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import { getCreatorAndAssociatedCreatorsByCreatorSlugMobile } from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import MobileCreatorCard from "../../../../components/app/MobileCreatorCard";
import CreatorsGrid from "../../../../features/app/components/RelatedCreators";
import CreatorNavTabs from "../../../../features/app/components/CreatorNavTabs";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;

    const [error, result] =
      await getCreatorAndAssociatedCreatorsByCreatorSlugMobile(slug);

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

    const { creator, associatedCreators } = result;

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
              showCreatorsTab={associatedCreators.length > 0}
              creator={creator}
              currentPath={currentPath}
            />
            <CreatorsGrid creators={associatedCreators} />
          </div>
        </Page>
      </AppLayout>,
    );
  },
);
