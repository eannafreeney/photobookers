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
} from "../../../../../features/dashboard/admin/planner/newsletterServices";
import { parseDateString, toDateString } from "../../../../../lib/utils";
import { NewsletterCampaign } from "../../../../../db/schema";
import FormPost from "../../../../../components/forms/FormPost";

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

  if (
    weekStartForSelection &&
    !Number.isNaN(weekStartForSelection.getTime())
  ) {
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
    selectedCampaign = (await getNewsletterCampaignById(campaignIdQuery)) ?? null;
  } else {
    const [draftError, draftCampaign] = await ensureCurrentWeeklyNewsletterDraft();
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
    <CampaignControls selectedCampaign={selectedCampaign} />
    <CampaignPreview previewHtml={previewHtml} />
    <div class="rounded border border-outline bg-surface p-4">
      <h2 class="text-lg font-semibold text-on-surface-strong">
        Edit draft copy
      </h2>
      <CampaignTextForm selectedCampaign={selectedCampaign} />
    </div>
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
        Edit copy, paste the HTML into MailerLite&apos;s Custom HTML editor, then
        check the box when it has been sent. Use Preview and test before sending.
      </p>
    </div>
  </div>
);

type CampaignTextFormProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignTextForm = ({ selectedCampaign }: CampaignTextFormProps) => {
  const saveAttrs = {
    "x-target": "toast",
  };

  return (
    <FormPost
      action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/save`}
      class="space-y-3"
      {...saveAttrs}
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
          class="rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer"
        >
          Save draft
        </button>
      </div>
    </FormPost>
  );
};

type CampaignControlsProps = {
  selectedCampaign: NewsletterCampaign;
};

const CampaignControls = ({ selectedCampaign }: CampaignControlsProps) => {
  const regenerateAttrs = {
    "x-target": "toast",
  };

  const markSentAttrs = {
    "x-target": "toast",
  };

  const deleteDraftAlpineAttrs = {
    "@ajax:before":
      "confirm('Delete this newsletter draft?') || $event.preventDefault()",
  };
  const isSent = selectedCampaign.status === "sent";

  return (
    <div class="rounded border border-outline bg-surface p-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap gap-2">
          <FormPost
            action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/regenerate`}
            {...regenerateAttrs}
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
          {...markSentAttrs}
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
  <div
    class="rounded border border-outline bg-surface p-4"
    x-data="{ view: 'desktop', copied: false }"
  >
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold text-on-surface-strong">Preview</h2>
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex rounded border border-outline bg-surface-alt p-0.5"
          role="group"
          aria-label="Preview viewport"
        >
          <button
            type="button"
            class="rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors"
            x-bind:class="view === 'desktop' ? 'bg-surface text-on-surface-strong shadow-sm' : 'text-on-surface hover:bg-surface'"
            x-on:click="view = 'desktop'"
            x-bind:aria-pressed="view === 'desktop'"
          >
            Desktop
          </button>
          <button
            type="button"
            class="rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors"
            x-bind:class="view === 'mobile' ? 'bg-surface text-on-surface-strong shadow-sm' : 'text-on-surface hover:bg-surface'"
            x-on:click="view = 'mobile'"
            x-bind:aria-pressed="view === 'mobile'"
          >
            Mobile
          </button>
        </div>
        <button
          type="button"
          class="rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer"
          x-on:click="
            const iframe = document.querySelector('iframe[title=\'Weekly newsletter preview\']');
            const source = document.getElementById('newsletter-html-source');
            const html = iframe?.getAttribute('srcdoc') ?? source?.value ?? '';
            if (html) navigator.clipboard.writeText(html);
            copied = true;
            setTimeout(() => copied = false, 2000);
          "
          x-text="copied ? 'Copied!' : 'Copy HTML'"
        />
      </div>
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
    <div
      class="overflow-auto rounded border border-outline bg-surface-alt"
      x-bind:class="view === 'mobile' ? 'flex min-h-[620px] justify-center p-4' : 'p-0'"
    >
      <iframe
        title="Weekly newsletter preview"
        srcdoc={previewHtml}
        class="h-[620px] shrink-0 rounded border border-outline bg-white"
        x-bind:class="view === 'mobile' ? 'w-[375px] max-w-full shadow-md' : 'w-full'"
      />
    </div>
  </div>
);
