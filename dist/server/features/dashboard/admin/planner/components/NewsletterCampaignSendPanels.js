import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { isBrevoNewsletterConfigured } from "../newsletterBrevoServices.js";
const NEWSLETTER_CAMPAIGN_CONTROLS_ID = "newsletter-campaign-controls";
const NEWSLETTER_BREVO_PANEL_ID = "newsletter-brevo-panel";
const BREVO_SEND_AJAX_TARGETS = `toast ${NEWSLETTER_CAMPAIGN_CONTROLS_ID} ${NEWSLETTER_BREVO_PANEL_ID}`;
const NewsletterCampaignControls = ({
  selectedCampaign
}) => {
  const regenerateAttrs = {
    "x-target": "toast"
  };
  const markSentAttrs = {
    "x-target": "toast"
  };
  const deleteDraftAlpineAttrs = {
    "@ajax:before": "confirm('Delete this newsletter draft?') || $event.preventDefault()"
  };
  const isSent = selectedCampaign.status === "sent";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: NEWSLETTER_CAMPAIGN_CONTROLS_ID,
      class: "rounded border border-outline bg-surface p-4",
      children: [
        /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx(
              FormPost,
              {
                action: `/dashboard/admin/planner/newsletters/${selectedCampaign.id}/regenerate`,
                ...regenerateAttrs,
                children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    class: "rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer",
                    children: "Regenerate BOTD items"
                  }
                )
              }
            ),
            !isSent && /* @__PURE__ */ jsx(
              FormPost,
              {
                action: `/dashboard/admin/planner/newsletters/${selectedCampaign.id}/delete`,
                ...deleteDraftAlpineAttrs,
                children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    class: "rounded border border-danger bg-danger px-3 py-2 text-sm font-medium text-on-danger hover:opacity-90 cursor-pointer",
                    children: "Delete draft"
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            FormPost,
            {
              action: `/dashboard/admin/planner/newsletters/${selectedCampaign.id}/mark-sent`,
              class: "flex items-center gap-2",
              ...markSentAttrs,
              children: [
                /* @__PURE__ */ jsx("input", { type: "hidden", name: "sent", value: "false" }),
                /* @__PURE__ */ jsxs("label", { class: "flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface-strong", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      name: "sent",
                      value: "true",
                      checked: isSent,
                      class: "h-4 w-4 rounded border-outline",
                      onchange: "this.form.requestSubmit()"
                    }
                  ),
                  "Sent via Brevo"
                ] })
              ]
            }
          )
        ] }),
        selectedCampaign.sentAt ? /* @__PURE__ */ jsxs("p", { class: "mt-2 text-xs text-on-surface", children: [
          "Sent: ",
          selectedCampaign.sentAt.toLocaleString()
        ] }) : null
      ]
    }
  );
};
const NewsletterBrevoPanel = ({
  selectedCampaign,
  defaultTestEmail
}) => {
  const brevoReady = isBrevoNewsletterConfigured();
  const isSent = selectedCampaign.status === "sent";
  const toastAttrs = { "x-target": "toast" };
  const sendListConfirmAttrs = {
    "@ajax:before": "confirm('Send this newsletter to your Brevo list now?') || $event.preventDefault()",
    "x-target": BREVO_SEND_AJAX_TARGETS,
    "x-target.error": "toast"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: NEWSLETTER_BREVO_PANEL_ID,
      class: "rounded border border-outline bg-surface p-4",
      children: [
        /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong", children: "Send via Brevo" }),
        !brevoReady ? /* @__PURE__ */ jsxs("p", { class: "mt-2 text-sm text-on-surface", children: [
          "Set",
          " ",
          /* @__PURE__ */ jsx("code", { class: "rounded bg-surface-alt px-1", children: "BREVO_API_KEY" }),
          ",",
          " ",
          /* @__PURE__ */ jsx("code", { class: "rounded bg-surface-alt px-1", children: "BREVO_NEWSLETTER_LIST_ID" }),
          ", and",
          " ",
          /* @__PURE__ */ jsx("code", { class: "rounded bg-surface-alt px-1", children: "BREVO_SENDER_EMAIL" }),
          " ",
          "(verified in Brevo) on the server to enable sending from here."
        ] }) : /* @__PURE__ */ jsxs("div", { class: "mt-3 space-y-4", children: [
          /* @__PURE__ */ jsxs(
            FormPost,
            {
              action: `/dashboard/admin/planner/newsletters/${selectedCampaign.id}/send-brevo-test`,
              class: "flex flex-wrap items-end gap-2",
              ...toastAttrs,
              children: [
                /* @__PURE__ */ jsxs("label", { class: "block text-sm", children: [
                  /* @__PURE__ */ jsx("span", { class: "mb-1 block text-on-surface", children: "Test email" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      name: "email",
                      placeholder: "you@example.com",
                      value: defaultTestEmail,
                      class: "w-64 rounded border border-outline bg-surface-alt px-3 py-2",
                      disabled: isSent
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    class: "rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                    disabled: isSent,
                    children: "Send Brevo test"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface", children: "Brevo requires test recipients to be contacts on your newsletter list \u2014 we add the address automatically before sending." }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              FormPost,
              {
                action: `/dashboard/admin/planner/newsletters/${selectedCampaign.id}/send-brevo`,
                ...sendListConfirmAttrs,
                children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    class: "rounded border border-outline bg-primary px-3 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                    disabled: isSent,
                    children: "Send to Brevo list"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("p", { class: "mt-2 text-xs text-on-surface", children: [
              "Uses list ID from",
              " ",
              /* @__PURE__ */ jsx("code", { class: "rounded bg-surface-alt px-1", children: "BREVO_NEWSLETTER_LIST_ID" }),
              ". Marks this draft as sent on success."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { class: "mt-3 text-xs text-on-surface", children: `Brevo IP blocking: leave "block unauthorized IPs" off until your server's outbound IP is listed under Security \u2192 Authorized IPs (otherwise API calls from the app will fail).` })
      ]
    }
  );
};
export {
  BREVO_SEND_AJAX_TARGETS,
  NEWSLETTER_BREVO_PANEL_ID,
  NEWSLETTER_CAMPAIGN_CONTROLS_ID,
  NewsletterBrevoPanel,
  NewsletterCampaignControls
};
