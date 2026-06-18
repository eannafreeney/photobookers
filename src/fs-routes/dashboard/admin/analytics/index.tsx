import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import SectionTitle from "../../../../components/app/SectionTitle";
import { getFlash, getUser } from "../../../../utils";
import AnalyticsOverview from "../../../../features/dashboard/admin/analytics/components/AnalyticsOverview";
import TopBooksTable from "../../../../features/dashboard/admin/analytics/components/TopBooksTable";
import TopBooksByViewsTable from "../../../../features/dashboard/admin/analytics/components/TopBooksByViewsTable";
import TopCreatorsTable from "../../../../features/dashboard/admin/analytics/components/TopCreatorsTable";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout
      title="Analytics"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          <div class="flex flex-col gap-12">
            <SectionTitle>Book analytics</SectionTitle>
            <AnalyticsOverview />
            <TopBooksByViewsTable />
            <TopBooksTable />
            <TopCreatorsTable role="publisher" title="Top publishers" />
            <TopCreatorsTable role="artist" title="Top artists" />
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
