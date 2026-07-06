import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import Button from "../../../components/app/Button.js";
import {
  aboutAudienceNav,
  aboutAudienceSections,
  aboutDifferentiators,
  aboutEditorialLinks,
  aboutPageMeta
} from "../content/aboutPageContent.js";
const textLinkClass = "underline decoration-accent underline-offset-4 hover:text-accent";
const AboutPageContent = () => /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-2xl flex-col gap-10", children: [
  /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface", children: aboutPageMeta.lead }),
  /* @__PURE__ */ jsx(
    "nav",
    {
      "aria-label": "Audience sections",
      class: "flex flex-wrap gap-2 border-y border-outline py-4",
      children: aboutAudienceNav.map((item) => /* @__PURE__ */ jsx(
        "a",
        {
          href: `#${item.id}`,
          class: "rounded-full border border-outline px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent",
          children: item.label
        }
      ))
    }
  ),
  aboutAudienceSections.map((section) => /* @__PURE__ */ jsxs(
    "section",
    {
      id: section.id,
      class: "flex scroll-mt-24 flex-col gap-4 border-t border-outline pt-8",
      children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: section.kicker, children: section.title }),
        /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface", children: section.intro }),
        /* @__PURE__ */ jsx("ul", { class: "flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-on-surface", children: section.bullets.map((bullet) => /* @__PURE__ */ jsx("li", { children: bullet })) }),
        /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface", children: section.closing }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center", children: [
          /* @__PURE__ */ jsx("a", { href: section.primaryCta.href, children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", type: "button", children: section.primaryCta.label }) }),
          section.secondaryCtas.map((cta) => /* @__PURE__ */ jsx(
            "a",
            {
              href: cta.href,
              class: `text-sm font-medium text-on-surface-strong ${textLinkClass}`,
              children: cta.label
            }
          ))
        ] })
      ]
    }
  )),
  /* @__PURE__ */ jsxs(
    "section",
    {
      id: "why-here",
      class: "flex scroll-mt-24 flex-col gap-4 border-t border-outline pt-8",
      children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: aboutDifferentiators.kicker, children: aboutDifferentiators.title }),
        /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface", children: aboutDifferentiators.body }),
        /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: aboutDifferentiators.pillars.map((pillar) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-t-2 border-on-surface-strong pt-3", children: [
          /* @__PURE__ */ jsx("h3", { class: "font-display text-lg font-medium text-on-surface-strong", children: pillar.title }),
          /* @__PURE__ */ jsx("p", { class: "text-sm leading-relaxed text-on-surface", children: pillar.description })
        ] })) })
      ]
    }
  ),
  /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-3 border-t border-outline pt-8", children: [
    /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: "Every week", children: "An editorial rhythm" }),
    /* @__PURE__ */ jsxs("p", { class: "text-base leading-relaxed text-on-surface", children: [
      "Every day we feature a",
      " ",
      /* @__PURE__ */ jsx("a", { href: aboutEditorialLinks[0].href, class: textLinkClass, children: aboutEditorialLinks[0].label }),
      ", and every week an",
      " ",
      /* @__PURE__ */ jsx("a", { href: aboutEditorialLinks[1].href, class: textLinkClass, children: aboutEditorialLinks[1].label }),
      " ",
      "and a",
      " ",
      /* @__PURE__ */ jsx("a", { href: aboutEditorialLinks[2].href, class: textLinkClass, children: aboutEditorialLinks[2].label }),
      ", alongside",
      " ",
      /* @__PURE__ */ jsx("a", { href: aboutEditorialLinks[3].href, class: textLinkClass, children: aboutEditorialLinks[3].label }),
      " ",
      "with the people behind the books. The best way to keep up is the",
      " ",
      /* @__PURE__ */ jsx("a", { href: aboutEditorialLinks[4].href, class: textLinkClass, children: aboutEditorialLinks[4].label }),
      "."
    ] })
  ] })
] });
var AboutPageContent_default = AboutPageContent;
export {
  AboutPageContent_default as default
};
