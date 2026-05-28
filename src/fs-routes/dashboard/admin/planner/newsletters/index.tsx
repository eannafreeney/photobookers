import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../../../utils";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import Sidebar from "../../../../../components/app/Sidebar";
import {
  buildCampaignPreviewHtml,
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  listNewsletterCampaigns,
} from "../../../../../features/dashboard/admin/planner/newsletterServices";
import { parseDateString, toDateString } from "../../../../../lib/utils";
import { NewsletterCampaign } from "../../../../../db/schema";
import FormPost from "../../../../../components/forms/FormPost";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const [draftError] = await ensureCurrentWeeklyNewsletterDraft();
  if (draftError) {
    console.error("Failed to ensure weekly draft", draftError.reason);
  }

  const weekStartQuery = c.req.query("weekStart");
  const weekStartForSelection =
    weekStartQuery && weekStartQuery.length > 0
      ? parseDateString(weekStartQuery)
      : null;
  if (weekStartForSelection && !Number.isNaN(weekStartForSelection.getTime())) {
    const weekEndForSelection = new Date(weekStartForSelection);
    weekEndForSelection.setUTCDate(weekEndForSelection.getUTCDate() + 6);
    const [ensureWeekDraftError] = await ensureWeeklyNewsletterDraftForRange(
      weekStartForSelection,
      weekEndForSelection,
    );
    if (ensureWeekDraftError) {
      console.error(
        "Failed to ensure selected week draft",
        ensureWeekDraftError.reason,
      );
    }
  }

  const campaigns = await listNewsletterCampaigns(16);
  const selectedCampaignIdFromWeek =
    weekStartForSelection && !Number.isNaN(weekStartForSelection.getTime())
      ? campaigns.find(
          (campaign) =>
            toDateString(campaign.weekStart) ===
            toDateString(weekStartForSelection),
        )?.id
      : null;
  const selectedCampaignId =
    c.req.query("campaignId") ??
    selectedCampaignIdFromWeek ??
    campaigns[0]?.id ??
    null;
  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === selectedCampaignId) ??
    campaigns[0] ??
    null;
  const previewHtml = selectedCampaign
    ? buildCampaignPreviewHtml(selectedCampaign)
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
          <CampaignHeader selectedCampaign={selectedCampaign} />

          <div>
            {selectedCampaign ? (
              <CampaignOverview
                selectedCampaign={selectedCampaign}
                previewHtml={previewHtml}
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

type CampaignOverviewProps = {
  selectedCampaign: NewsletterCampaign;
  previewHtml: string;
};

const CampaignOverview = ({
  selectedCampaign,
  previewHtml,
}: CampaignOverviewProps) => (
  <div class="space-y-4">
    <div class="rounded border border-outline bg-surface p-4">
      <h2 class="text-lg font-semibold text-on-surface-strong">
        Edit draft copy
      </h2>
      <CampaignTextForm selectedCampaign={selectedCampaign} />
    </div>
    <CampaignControls selectedCampaign={selectedCampaign} />
    <CampaignPreview previewHtml={previewHtml} />
  </div>
);

type CampaignHeaderProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignHeader = ({ selectedCampaign }: CampaignHeaderProps) => (
  <div class="mb-6 flex items-center justify-between gap-3">
    <div>
      <h1 class="text-xl font-semibold text-on-surface-strong">
        Weekly BOTD newsletter
      </h1>
      <p class="mb-3 text-sm text-on-surface">
        Week: {toDateString(selectedCampaign.weekStart)} to{" "}
        {toDateString(selectedCampaign.weekEnd)}
      </p>
      <p class="text-sm text-on-surface">
        Edit copy, copy the HTML into MailerLite, then check the box when it has
        been sent.
      </p>
    </div>
  </div>
);

type CampaignTextFormProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignTextForm = ({ selectedCampaign }: CampaignTextFormProps) => (
  <form
    method="post"
    action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/save`}
    class="space-y-3"
  >
    <label class="block text-sm">
      <span class="mb-1 block text-on-surface">Subject</span>
      <input
        type="text"
        name="subject"
        required
        value={selectedCampaign.subject}
        class="w-full rounded border border-outline bg-surface-alt px-3 py-2"
      />
    </label>
    <label class="block text-sm">
      <span class="mb-1 block text-on-surface">Intro</span>
      <textarea
        name="introText"
        required
        rows={4}
        class="w-full rounded border border-outline bg-surface-alt px-3 py-2"
      >
        {selectedCampaign.introText}
      </textarea>
    </label>
    <label class="block text-sm">
      <span class="mb-1 block text-on-surface">Outro</span>
      <textarea
        name="outroText"
        required
        rows={4}
        class="w-full rounded border border-outline bg-surface-alt px-3 py-2"
      >
        {selectedCampaign.outroText}
      </textarea>
    </label>
    <label class="block text-sm">
      <span class="mb-1 block text-on-surface">CTA</span>
      <input
        type="text"
        name="ctaText"
        required
        value={selectedCampaign.ctaText}
        class="w-full rounded border border-outline bg-surface-alt px-3 py-2"
      />
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        type="submit"
        class="rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface"
      >
        Save draft
      </button>
    </div>
  </form>
);

type CampaignControlsProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignControls = ({ selectedCampaign }: CampaignControlsProps) => {
  const deleteDraftAlpineAttrs = {
    "@ajax:before":
      "confirm('Delete this newsletter draft?') || $event.preventDefault()",
  };
  const isSent = selectedCampaign.status === "sent";

  return (
    <div class="rounded border border-outline bg-surface p-4">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-outline pb-4 mb-4">
        <div class="flex flex-wrap gap-2">
          <FormPost
            action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/regenerate`}
          >
            <button
              type="submit"
              class="rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer"
            >
              Regenerate BOTD items
            </button>
          </FormPost>
          {!isSent && (
            <FormPost
              action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/delete`}
              {...deleteDraftAlpineAttrs}
            >
              <button
                type="submit"
                class="rounded border border-danger bg-danger px-3 py-2 text-sm font-medium text-on-danger hover:opacity-90 cursor-pointer"
              >
                Delete draft
              </button>
            </FormPost>
          )}
        </div>

        <FormPost
          action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/mark-sent`}
          class="flex items-center gap-2"
        >
          <input type="hidden" name="sent" value="false" />
          <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface-strong">
            <input
              type="checkbox"
              name="sent"
              value="true"
              checked={isSent}
              class="h-4 w-4 rounded border-outline"
              onchange="this.form.requestSubmit()"
            />
            Sent in MailerLite
          </label>
        </FormPost>
      </div>

      {selectedCampaign.sentAt && (
        <p class="text-xs text-on-surface">
          Sent: {selectedCampaign.sentAt.toLocaleString()}
        </p>
      )}
    </div>
  );
};

type CampaignPreviewProps = {
  previewHtml: string;
};

const CampaignPreview = ({ previewHtml }: CampaignPreviewProps) => (
  <div class="rounded border border-outline bg-surface p-4">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold text-on-surface-strong">Preview</h2>
      <button
        type="button"
        class="rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer"
        x-data="{ copied: false }"
        x-on:click="
          const source = document.getElementById('newsletter-html-source');
          if (source) navigator.clipboard.writeText(source.value);
          copied = true;
          setTimeout(() => copied = false, 2000);
        "
        x-text="copied ? 'Copied!' : 'Copy HTML'"
      />
    </div>
    <textarea
      id="newsletter-html-source"
      class="sr-only"
      readonly
      aria-hidden="true"
      tabindex={-1}
    >
      {previewHtml}
    </textarea>
    <iframe
      title="Weekly newsletter preview"
      srcdoc={previewHtml}
      class="h-[620px] w-full rounded border border-outline bg-white"
    />
  </div>
);
