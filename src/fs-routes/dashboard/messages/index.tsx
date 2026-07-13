import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import InfoPage from "../../../pages/InfoPage";
import MessagesTable from "../../../features/dashboard/messages/components/MessagesTable";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell";
import { getPendingClaim } from "../../../features/claims/services";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!user.creator)
    return c.html(<InfoPage errorMessage="Creator not found" />);

  const creator = user.creator;

  const [claimError, claim] = await getPendingClaim(user.id, creator.id);
  if (claimError)
    return c.html(<InfoPage errorMessage={claimError.reason} user={user} />);

  return c.html(
    <AppLayout title="Posts" user={user} currentPath={currentPath}>
      <CreatorDashboardShell
        currentPath={currentPath}
        user={user}
        claimStatus={claim?.status ?? null}
      >
        <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <MessageForm creatorId={creator.id} />
          <MessagesTable creatorId={creator.id} />
        </div>
      </CreatorDashboardShell>
    </AppLayout>,
  );
});
