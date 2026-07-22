import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Sidebar from "../../../../components/app/Sidebar";
import {
  buildCampaignPreviewHtml,
  getNewsletterCampaignById,
} from "../../../../features/dashboard/admin/newsletters/services";
import CampaignHeader from "@/features/dashboard/admin/newsletters/components/CampaignHeader";
import CampaignOverview from "@/features/dashboard/admin/newsletters/components/CampaignOverview";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const campaignId = c.req.param("campaignId");

  const selectedCampaign = campaignId
    ? ((await getNewsletterCampaignById(campaignId)) ?? null)
    : null;

  const previewHtml = selectedCampaign
    ? await buildCampaignPreviewHtml(selectedCampaign)
    : "";

  return c.html(
    <AppLayout
      title="Weekly BOTD Newsletter"
      user={user}
      currentPath={currentPath}
      flash={flash}
    >
      <Page>
        <Sidebar currentPath={currentPath}>
          {selectedCampaign ? (
            <>
              <CampaignHeader selectedCampaign={selectedCampaign} />
              <CampaignOverview
                selectedCampaign={selectedCampaign}
                previewHtml={previewHtml}
                defaultTestEmail={user?.email ?? ""}
              />
            </>
          ) : (
            <div class="rounded border border-outline bg-surface p-4 text-sm text-on-surface">
              Newsletter not found.
            </div>
          )}
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
