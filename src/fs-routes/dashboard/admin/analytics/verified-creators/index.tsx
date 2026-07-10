import { createRoute } from "hono-fsr";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import Sidebar from "../../../../../components/app/Sidebar";
import Link from "../../../../../components/app/Link";
import { getUser } from "../../../../../utils";
import { paginationRequestBaseUrl } from "../../../../../lib/pagination";
import VerifiedCreatorsTable from "../../../../../features/dashboard/admin/analytics/components/VerifiedCreatorsTable";
import { adminAnalyticsHref } from "../../../../../features/dashboard/admin/analytics/adminAnalyticsPanel";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const paginationBaseUrl = paginationRequestBaseUrl(c.req.url);

  return c.html(
    <AppLayout title="Verified creators" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <div class="flex flex-col gap-6">
            <Link
              href={adminAnalyticsHref(null, { tab: "books" })}
              className="text-sm text-on-surface hover:text-on-surface-strong"
            >
              ← Back to book analytics
            </Link>
            <VerifiedCreatorsTable
              currentPage={currentPage}
              currentPath={paginationBaseUrl}
            />
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
