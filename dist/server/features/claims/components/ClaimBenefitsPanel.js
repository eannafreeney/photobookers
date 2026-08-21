import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const benefits = [
  {
    title: "Control",
    body: "Fix your catalog, buy links, and how your work is presented."
  },
  {
    title: "Audience",
    body: "Post updates to followers and mark book fair attendance."
  },
  {
    title: "Insights",
    body: "Unlock full analytics on views, favorites, and purchase clicks."
  }
];
const ClaimBenefitsPanel = ({ displayName }) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 rounded-radius border border-outline bg-surface-alt/40 p-5", children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { class: "kicker text-accent mb-1", children: "Already on Photobookers" }),
    /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface text-pretty md:text-base", children: [
      /* @__PURE__ */ jsx("strong", { children: displayName }),
      " already has a public profile with books on Photobookers. Claim it to take control \u2014 collectors are already finding you."
    ] })
  ] }),
  /* @__PURE__ */ jsx("ul", { class: "grid gap-3 sm:grid-cols-3", children: benefits.map((item) => /* @__PURE__ */ jsxs(
    "li",
    {
      class: "list-none rounded-radius border border-outline bg-surface p-4",
      children: [
        /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong", children: item.title }),
        /* @__PURE__ */ jsx("p", { class: "mt-1 text-sm text-on-surface-weak", children: item.body })
      ]
    },
    item.title
  )) })
] });
var ClaimBenefitsPanel_default = ClaimBenefitsPanel;
export {
  ClaimBenefitsPanel_default as default
};
