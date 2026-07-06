import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../../../utils.js";
import AppLayout from "../../../../../components/layouts/AppLayout.js";
import Page from "../../../../../components/layouts/Page.js";
import Sidebar from "../../../../../components/app/Sidebar.js";
import {
  buildCampaignPreviewHtml,
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  getNewsletterCampaignById,
  getNewsletterCampaignRange
} from "../../../../../features/dashboard/admin/planner/newsletterServices.js";
import { formatNewsletterWeekRange } from "../../../../../features/dashboard/admin/planner/newsletterUtils.js";
import { parseDateString } from "../../../../../lib/utils.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import {
  NewsletterBrevoPanel,
  NewsletterCampaignControls
} from "../../../../../features/dashboard/admin/planner/components/NewsletterCampaignSendPanels.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const weekStartQuery = c.req.query("weekStart");
  const weekStartForSelection = weekStartQuery && weekStartQuery.length > 0 ? parseDateString(weekStartQuery) : null;
  const campaignIdQuery = c.req.query("campaignId");
  let selectedCampaign = null;
  if (weekStartForSelection && !Number.isNaN(weekStartForSelection.getTime())) {
    const [ensureWeekDraftError, ensuredCampaign] = await ensureWeeklyNewsletterDraftForRange(weekStartForSelection);
    if (ensureWeekDraftError) {
      console.error(
        "Failed to ensure selected week draft",
        ensureWeekDraftError.reason
      );
    }
    selectedCampaign = ensuredCampaign ?? null;
  } else if (campaignIdQuery) {
    selectedCampaign = await getNewsletterCampaignById(campaignIdQuery) ?? null;
  } else {
    const [draftError, draftCampaign] = await ensureCurrentWeeklyNewsletterDraft();
    if (draftError) {
      console.error("Failed to ensure weekly draft", draftError.reason);
    }
    selectedCampaign = draftCampaign ?? null;
  }
  const previewHtml = selectedCampaign ? await buildCampaignPreviewHtml(selectedCampaign) : "";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Weekly BOTD Newsletter",
        user,
        currentPath,
        flash,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(Sidebar, { currentPath, children: [
          selectedCampaign ? /* @__PURE__ */ jsx(CampaignHeader, { selectedCampaign }) : /* @__PURE__ */ jsx("div", { class: "mb-6", children: /* @__PURE__ */ jsx("h1", { class: "text-xl font-semibold text-on-surface-strong", children: "Weekly BOTD newsletter" }) }),
          /* @__PURE__ */ jsx("div", { children: selectedCampaign ? /* @__PURE__ */ jsx(
            CampaignOverview,
            {
              selectedCampaign,
              previewHtml,
              defaultTestEmail: user?.email ?? ""
            }
          ) : /* @__PURE__ */ jsx("div", { class: "rounded border border-outline bg-surface p-4 text-sm text-on-surface", children: "No campaigns yet." }) })
        ] }) })
      }
    )
  );
});
const CampaignOverview = ({
  selectedCampaign,
  previewHtml,
  defaultTestEmail
}) => /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
  /* @__PURE__ */ jsx(NewsletterCampaignControls, { selectedCampaign }),
  /* @__PURE__ */ jsx(
    NewsletterBrevoPanel,
    {
      selectedCampaign,
      defaultTestEmail
    }
  ),
  /* @__PURE__ */ jsx(CampaignPreview, { previewHtml }),
  /* @__PURE__ */ jsxs("div", { class: "rounded border border-outline bg-surface p-4", children: [
    /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong", children: "Edit draft copy" }),
    /* @__PURE__ */ jsx(CampaignTextForm, { selectedCampaign })
  ] })
] });
const CampaignHeader = ({ selectedCampaign }) => {
  const { weekStart, weekEnd } = getNewsletterCampaignRange(selectedCampaign);
  return /* @__PURE__ */ jsx("div", { class: "mb-6 flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { class: "text-xl font-semibold text-on-surface-strong", children: "Weekly BOTD newsletter" }),
    /* @__PURE__ */ jsxs("p", { class: "mb-3 text-sm text-on-surface", children: [
      "Edition: ",
      formatNewsletterWeekRange(weekStart, weekEnd)
    ] }),
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Edit copy, preview the email, send a Brevo test, then send to your list when ready. You can still copy HTML manually if needed." })
  ] }) });
};
const CampaignTextForm = ({ selectedCampaign }) => {
  const saveAttrs = {
    "x-target": "toast"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      action: `/dashboard/admin/planner/newsletters/${selectedCampaign.id}/save`,
      class: "space-y-3",
      ...saveAttrs,
      children: [
        /* @__PURE__ */ jsxs("label", { class: "block text-sm", children: [
          /* @__PURE__ */ jsx("span", { class: "mb-1 block text-on-surface", children: "Subject" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "subject",
              required: true,
              value: selectedCampaign.subject,
              class: "w-full rounded border border-outline bg-surface-alt px-3 py-2"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { class: "block text-sm", children: [
          /* @__PURE__ */ jsx("span", { class: "mb-1 block text-on-surface", children: "Intro" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "introText",
              required: true,
              rows: 4,
              class: "w-full rounded border border-outline bg-surface-alt px-3 py-2",
              children: selectedCampaign.introText
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { class: "block text-sm", children: [
          /* @__PURE__ */ jsx("span", { class: "mb-1 block text-on-surface", children: "Outro" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "outroText",
              required: true,
              rows: 4,
              class: "w-full rounded border border-outline bg-surface-alt px-3 py-2",
              children: selectedCampaign.outroText
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { class: "block text-sm", children: [
          /* @__PURE__ */ jsx("span", { class: "mb-1 block text-on-surface", children: "CTA" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "ctaText",
              required: true,
              value: selectedCampaign.ctaText,
              class: "w-full rounded border border-outline bg-surface-alt px-3 py-2"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { class: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            class: "rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer",
            children: "Save draft"
          }
        ) })
      ]
    }
  );
};
const CampaignPreview = ({ previewHtml }) => /* @__PURE__ */ jsxs(
  "div",
  {
    class: "rounded border border-outline bg-surface p-4",
    "x-data": "{ view: 'desktop', copied: false }",
    children: [
      /* @__PURE__ */ jsxs("div", { class: "mb-2 flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong", children: "Preview" }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              class: "inline-flex rounded border border-outline bg-surface-alt p-0.5",
              role: "group",
              "aria-label": "Preview viewport",
              children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    class: "rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors",
                    "x-bind:class": "view === 'desktop' ? 'bg-surface text-on-surface-strong shadow-sm' : 'text-on-surface hover:bg-surface'",
                    "x-on:click": "view = 'desktop'",
                    "x-bind:aria-pressed": "view === 'desktop'",
                    children: "Desktop"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    class: "rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors",
                    "x-bind:class": "view === 'mobile' ? 'bg-surface text-on-surface-strong shadow-sm' : 'text-on-surface hover:bg-surface'",
                    "x-on:click": "view = 'mobile'",
                    "x-bind:aria-pressed": "view === 'mobile'",
                    children: "Mobile"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              class: "rounded border border-outline bg-surface-alt px-3 py-2 text-sm font-medium hover:bg-surface cursor-pointer",
              "x-on:click": "\n            const iframe = document.querySelector('iframe[title=\\'Weekly newsletter preview\\']');\n            const source = document.getElementById('newsletter-html-source');\n            const html = iframe?.getAttribute('srcdoc') ?? source?.value ?? '';\n            if (html) navigator.clipboard.writeText(html);\n            copied = true;\n            setTimeout(() => copied = false, 2000);\n          ",
              "x-text": "copied ? 'Copied!' : 'Copy HTML'"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "newsletter-html-source",
          class: "sr-only",
          readonly: true,
          "aria-hidden": "true",
          tabindex: -1,
          children: previewHtml
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          class: "overflow-auto rounded border border-outline bg-surface-alt",
          "x-bind:class": "view === 'mobile' ? 'flex min-h-[620px] justify-center p-4' : 'p-0'",
          children: /* @__PURE__ */ jsx(
            "iframe",
            {
              title: "Weekly newsletter preview",
              srcdoc: previewHtml,
              class: "h-[620px] shrink-0 rounded border border-outline bg-white",
              "x-bind:class": "view === 'mobile' ? 'w-[375px] max-w-full shadow-md' : 'w-full'"
            }
          )
        }
      )
    ]
  }
);
export {
  GET
};
