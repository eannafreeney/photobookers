import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../../../utils";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import Sidebar from "../../../../../components/app/Sidebar";
import {
  buildCampaignPreviewHtml,
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  getNewsletterCampaignById,
} from "../../../../../features/dashboard/admin/planner/newsletter/services";
import { parseDateString } from "../../../../../lib/utils";
import { NewsletterCampaign } from "../../../../../db/schema";
import CampaignHeader from "@/features/dashboard/admin/planner/newsletter/components/CampaignHeader";
import CampaignOverview from "@/features/dashboard/admin/planner/newsletter/components/CampaignOverview";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  const weekStartQuery = c.req.query("weekStart");
  const weekStartForSelection =
    weekStartQuery && weekStartQuery.length > 0
      ? parseDateString(weekStartQuery)
      : null;
  const campaignIdQuery = c.req.query("campaignId");

  let selectedCampaign: NewsletterCampaign | null = null;

  if (weekStartForSelection && !Number.isNaN(weekStartForSelection.getTime())) {
    const [ensureWeekDraftError, ensuredCampaign] =
      await ensureWeeklyNewsletterDraftForRange(weekStartForSelection);
    if (ensureWeekDraftError) {
      console.error(
        "Failed to ensure selected week draft",
        ensureWeekDraftError.reason,
      );
    }
    selectedCampaign = ensuredCampaign ?? null;
  } else if (campaignIdQuery) {
    selectedCampaign =
      (await getNewsletterCampaignById(campaignIdQuery)) ?? null;
  } else {
    const [draftError, draftCampaign] =
      await ensureCurrentWeeklyNewsletterDraft();
    if (draftError) {
      console.error("Failed to ensure weekly draft", draftError.reason);
    }
    selectedCampaign = draftCampaign ?? null;
  }

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
            <CampaignHeader selectedCampaign={selectedCampaign} />
          ) : (
            <div class="mb-6">
              <h1 class="text-xl font-semibold text-on-surface-strong">
                Weekly BOTD newsletter
              </h1>
            </div>
          )}

          <div>
            {selectedCampaign ? (
              <CampaignOverview
                selectedCampaign={selectedCampaign}
                previewHtml={previewHtml}
                defaultTestEmail={user?.email ?? ""}
              />
            ) : (
              <div class="rounded border border-outline bg-surface p-4 text-sm text-on-surface">
                No campaigns yet.
              </div>
            )}
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
