import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import SectionTitle from "../../../../components/app/SectionTitle";
import ClaimsTable from "../../../../features/dashboard/admin/claims/components/ClaimsTable";
import NavTabs from "../../../../features/dashboard/admin/components/NavTabs";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Admin Dashboard" user={user} currentPath={currentPath}>
      <NavTabs currentPath="/dashboard/admin/claims" />
      <div class="flex flex-col gap-4">
        <SectionTitle>Claims Pending Admin Review</SectionTitle>
        <ClaimsTable />
      </div>
    </AppLayout>,
  );
});
