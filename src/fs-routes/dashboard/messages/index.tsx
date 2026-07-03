import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import InfoPage from "../../../pages/InfoPage";
import CreatorMessages from "../../../features/app/components/CreatorMessages";
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
        <div class="grid grid-cols-2 gap-8">
          <MessageForm creatorId={creator.id} />
          <CreatorMessages creatorSlug={creator.slug} user={user} />
        </div>
      </CreatorDashboardShell>
    </AppLayout>,
  );
});
