import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const CampaignPreview = ({ previewHtml }) => /* @__PURE__ */ jsxs(
  "div",
  {
    id: "newsletter-preview",
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
              "x-on:click": "\n              const iframe = document.querySelector('iframe[title=\\'Weekly newsletter preview\\']');\n              const source = document.getElementById('newsletter-html-source');\n              const html = iframe?.getAttribute('srcdoc') ?? source?.value ?? '';\n              if (html) navigator.clipboard.writeText(html);\n              copied = true;\n              setTimeout(() => copied = false, 2000);\n            ",
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
var CampaignPreview_default = CampaignPreview;
export {
  CampaignPreview_default as default
};
