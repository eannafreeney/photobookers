import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell";
import CollectorDashboardShell from "../../../features/dashboard/components/CollectorDashboardShell";
import ProfileGuide from "../../../features/dashboard/guide/components/ProfileGuide";
import CollectorGuide from "../../../features/collectors/components/CollectorGuide";
import { getPendingClaim } from "../../../features/claims/services";
import { getFlash, getUser } from "../../../utils";
import { isFeatureEnabledForUser } from "../../../lib/features";
import InfoPage from "../../../pages/InfoPage";
import PageHeader from "@/components/app/PageHeader";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!user.creator) {
    if (!isFeatureEnabledForUser("collectors", user)) {
      return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
    }
    return c.html(
      <AppLayout title="Collector guide" user={user} flash={flash} currentPath={currentPath}>
        <CollectorDashboardShell currentPath={currentPath}>
          <PageHeader
            title="Getting started as a collector"
            intro="Make your shelf public, build it out, and connect with other collectors."
          />
          <CollectorGuide />
        </CollectorDashboardShell>
      </AppLayout>,
    );
  }

  const creator = user.creator;

  const [claimError, claim] = await getPendingClaim(user.id, creator.id);
  if (claimError) {
    return c.html(<InfoPage errorMessage={claimError.reason} user={user} />);
  }

  return c.html(
    <AppLayout
      title="Profile guide"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <CreatorDashboardShell
        currentPath={currentPath}
        user={user}
        claimStatus={claim?.status ?? null}
      >
        <PageHeader
          title="Get the most out of your profile"
          intro="A practical checklist for building a profile that gets discovered, followed, and bought from."
        />
        <ProfileGuide creator={creator} />
      </CreatorDashboardShell>
    </AppLayout>,
  );
});
