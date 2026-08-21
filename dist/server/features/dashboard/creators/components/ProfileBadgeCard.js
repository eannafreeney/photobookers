import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import { creatorPath } from "../../../app/spotlightUrls.js";
import {
  BADGE_SPECS,
  badgeAssetPath,
  badgeEmbedHtml
} from "../../../../lib/embedBadge.js";
const ProfileBadgeCard = ({ creator, badgeViewCount }) => {
  const snippets = Object.fromEntries(
    BADGE_SPECS.map((spec) => [
      spec.variant,
      badgeEmbedHtml({
        slug: creator.slug,
        displayName: creator.displayName,
        variant: spec.variant
      })
    ])
  );
  return /* @__PURE__ */ jsxs(
    "section",
    {
      class: "flex flex-col gap-4 rounded-radius border border-outline bg-surface-alt p-5",
      "x-data": `{ variant: 'brand', snippets: ${JSON.stringify(snippets)}, copied: false }`,
      children: [
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx(SectionTitle, { className: "", children: "Put Photobookers on your site" }),
          /* @__PURE__ */ jsx("p", { class: "max-w-2xl text-sm text-on-surface text-pretty", children: "Paste this next to your Instagram and website links so visitors can find your Photobookers profile. Pick a style, copy the code, and drop it into your site's HTML." })
        ] }),
        /* @__PURE__ */ jsx("div", { class: "flex flex-wrap gap-2", children: BADGE_SPECS.map((spec) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "x-on:click": `variant = '${spec.variant}'; copied = false`,
            "x-bind:class": `variant === '${spec.variant}' ? 'border-accent text-on-surface-strong' : 'border-outline text-on-surface-weak'`,
            class: "cursor-pointer rounded-radius border px-3 py-2 text-xs font-medium transition hover:opacity-75",
            children: spec.label
          }
        )) }),
        BADGE_SPECS.map((spec) => /* @__PURE__ */ jsxs(
          "div",
          {
            "x-cloak": true,
            "x-show": `variant === '${spec.variant}'`,
            class: "flex flex-col gap-3",
            children: [
              /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-weak", children: spec.hint }),
              /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { class: "flex items-center justify-center rounded-radius border border-outline bg-white px-6 py-4", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: badgeAssetPath(spec.variant),
                    alt: `${creator.displayName} on Photobookers`,
                    width: spec.width,
                    height: spec.height
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { class: "flex items-center justify-center rounded-radius border border-outline bg-neutral-900 px-6 py-4", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: badgeAssetPath(spec.variant),
                    alt: `${creator.displayName} on Photobookers`,
                    width: spec.width,
                    height: spec.height
                  }
                ) })
              ] })
            ]
          }
        )),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              for: "profile-badge-snippet",
              class: "text-xs font-medium uppercase tracking-[0.16em] text-on-surface-weak",
              children: "Embed code"
            }
          ),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "profile-badge-snippet",
              readonly: true,
              rows: 3,
              spellcheck: false,
              "x-text": "snippets[variant]",
              class: "w-full resize-none rounded-radius border border-outline bg-surface p-3 font-mono text-xs text-on-surface-strong"
            }
          ),
          /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "solid",
                color: "primary",
                width: "auto",
                "x-on:click": "copied = true; navigator.clipboard.writeText(snippets[variant])",
                "x-text": "copied ? 'Copied!' : 'Copy code'",
                children: "Copy code"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: creatorPath(creator.slug),
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-sm underline decoration-accent underline-offset-4",
                children: "Preview your profile"
              }
            )
          ] })
        ] }),
        typeof badgeViewCount === "number" ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: badgeViewCount === 0 ? "No badge visits yet \u2014 they'll show up here once people start clicking through." : `${badgeViewCount.toLocaleString()} profile ${badgeViewCount === 1 ? "visit has" : "visits have"} come from your badge.` }) : null
      ]
    }
  );
};
var ProfileBadgeCard_default = ProfileBadgeCard;
export {
  ProfileBadgeCard_default as default
};
