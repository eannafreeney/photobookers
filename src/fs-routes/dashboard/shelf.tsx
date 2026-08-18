import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import PageHeader from "@/components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import MemberDashboardShell from "../../features/dashboard/components/MemberDashboardShell";
import ShelfSharingPanel from "../../features/app/components/ShelfSharingPanel";
import { suggestShelfSlug } from "../../domain/shelf/services";
import { userCanHaveShelf } from "../../domain/shelf/utils";
import { getPendingClaim } from "../../features/claims/services";
import { getFlash, getUser } from "../../utils";
import { isFeatureEnabledForUser } from "../../lib/features";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!userCanHaveShelf(user) || !isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const suggestedSlug = await suggestShelfSlug(user.id);
  const claimStatus = user.creator
    ? ((await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null)
    : null;

  const alpineAttrs = {
    "x-init": true,
    "x-merge": "replace",
    "@avatar:updated.window":
      "$ajax('/dashboard/shelf', { target: 'shelf-settings-container' })",
  };

  return c.html(
    <AppLayout
      title="Shelf"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <MemberDashboardShell
        user={user}
        currentPath={currentPath}
        claimStatus={claimStatus}
      >
        <PageHeader
          title="Shelf"
          intro="Control whether your shelf is public and choose your public URL."
        />
        <div id="shelf-settings-container" {...alpineAttrs}>
          <ShelfSharingPanel
            user={user}
            suggestedSlug={suggestedSlug}
            defaultOpen
          />
        </div>
      </MemberDashboardShell>
    </AppLayout>,
  );
});
