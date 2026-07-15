import type { NewsletterCampaign } from "../../../../../db/schema";
import FormPost from "../../../../../components/forms/FormPost";
import { isBrevoNewsletterConfigured } from "../newsletter/brevoServices";
import Button from "@/components/app/Button";

export const NEWSLETTER_CAMPAIGN_CONTROLS_ID = "newsletter-campaign-controls";
export const NEWSLETTER_BREVO_PANEL_ID = "newsletter-brevo-panel";

export const BREVO_SEND_AJAX_TARGETS = `toast ${NEWSLETTER_CAMPAIGN_CONTROLS_ID} ${NEWSLETTER_BREVO_PANEL_ID}`;

type NewsletterCampaignControlsProps = {
  selectedCampaign: NewsletterCampaign;
};

export const NewsletterCampaignControls = ({
  selectedCampaign,
}: NewsletterCampaignControlsProps) => {
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
    <div
      id={NEWSLETTER_CAMPAIGN_CONTROLS_ID}
      class="rounded border border-outline bg-surface p-4"
    >
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
            Sent via Brevo
          </label>
        </FormPost>
      </div>

      {selectedCampaign.sentAt ? (
        <p class="mt-2 text-xs text-on-surface">
          Sent: {selectedCampaign.sentAt.toLocaleString()}
        </p>
      ) : null}
    </div>
  );
};

type NewsletterBrevoPanelProps = {
  selectedCampaign: NewsletterCampaign;
  defaultTestEmail: string;
};

export const NewsletterBrevoPanel = ({
  selectedCampaign,
  defaultTestEmail,
}: NewsletterBrevoPanelProps) => {
  const brevoReady = isBrevoNewsletterConfigured();
  const isSent = selectedCampaign.status === "sent";
  const toastAttrs = { "x-target": "toast" };
  const sendListConfirmAttrs = {
    "@ajax:before":
      "confirm('Send this newsletter to your Brevo list now?') || $event.preventDefault()",
    "x-target": BREVO_SEND_AJAX_TARGETS,
    "x-target.error": "toast",
  };

  return (
    <div
      id={NEWSLETTER_BREVO_PANEL_ID}
      class="rounded border border-outline bg-surface p-4"
    >
      <h2 class="text-lg font-semibold text-on-surface-strong">
        Send via Brevo
      </h2>
      {!brevoReady ? (
        <p class="mt-2 text-sm text-on-surface">
          Set <code class="rounded bg-surface-alt px-1">BREVO_API_KEY</code>,{" "}
          <code class="rounded bg-surface-alt px-1">
            BREVO_NEWSLETTER_LIST_ID
          </code>
          , and{" "}
          <code class="rounded bg-surface-alt px-1">BREVO_SENDER_EMAIL</code>{" "}
          (verified in Brevo) on the server to enable sending from here.
        </p>
      ) : (
        <div class="mt-3 space-y-4">
          <FormPost
            action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/send-brevo-test`}
            class="flex flex-wrap items-end gap-2"
            {...toastAttrs}
          >
            <label class="block text-sm">
              <span class="mb-1 block text-on-surface">Test email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={defaultTestEmail}
                class="w-64 rounded border border-outline bg-surface-alt px-3 py-2"
                disabled={isSent}
              />
            </label>
            <Button variant="solid" color="primary" isDisabled={isSent}>
              Send Brevo test
            </Button>
          </FormPost>
          <p class="text-xs text-on-surface">
            Brevo requires test recipients to be contacts on your newsletter
            list — we add the address automatically before sending.
          </p>

          <div>
            <FormPost
              action={`/dashboard/admin/planner/newsletters/${selectedCampaign.id}/send-brevo`}
              {...sendListConfirmAttrs}
            >
              <Button variant="solid" color="primary" isDisabled={isSent}>
                Send to Brevo list
              </Button>
            </FormPost>
          </div>
        </div>
      )}
    </div>
  );
};
