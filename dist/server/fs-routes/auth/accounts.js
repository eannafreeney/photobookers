import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import Button from "../../components/app/Button.js";
import {
  accountFeatures,
  accountMobileCards
} from "../../features/auth/accountsContent.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (user) return c.redirect("/");
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title: "Accounts", children: /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(
        PageHeader,
        {
          kicker: "Join Photobookers",
          title: "Choose your account",
          intro: "Fan, artist, or publisher \u2014 pick the account that fits how you live with photobooks."
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "md:hidden space-y-4", children: accountMobileCards.map((account) => /* @__PURE__ */ jsxs(
        "div",
        {
          class: "border-t-2 border-on-surface-strong bg-surface pt-4 pb-6 flex flex-col gap-4",
          children: [
            /* @__PURE__ */ jsx("h3", { class: "font-display text-2xl font-medium text-on-surface-strong", children: account.type }),
            /* @__PURE__ */ jsx("ul", { class: "list-disc list-inside text-sm text-on-surface space-y-1", children: account.features.map((f) => /* @__PURE__ */ jsx("li", { children: f.name }, f.name)) }),
            /* @__PURE__ */ jsx("a", { href: `/auth/register?type=${account.slug}`, class: "mt-auto", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "full", children: "Sign up" }) })
          ]
        },
        account.slug
      )) }),
      /* @__PURE__ */ jsx("div", { class: "hidden md:block overflow-hidden w-full overflow-x-auto border-y-2 border-on-surface-strong", children: /* @__PURE__ */ jsxs("table", { class: "w-full table-fixed text-left text-sm text-on-surface", children: [
        /* @__PURE__ */ jsx("thead", { class: "border-b border-outline-strong kicker text-on-surface-strong", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", class: "p-4", children: "Feature" }),
          /* @__PURE__ */ jsx("th", { scope: "col", class: "p-4 text-center", children: "Fan" }),
          /* @__PURE__ */ jsx("th", { scope: "col", class: "p-4 text-center", children: "Artist / Self-Publisher" }),
          /* @__PURE__ */ jsx("th", { scope: "col", class: "p-4 text-center", children: "Publisher" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { class: "divide-y divide-outline dark:divide-outline-dark", children: [
          accountFeatures.map((feature) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { class: "p-4 font-medium", children: feature.name }),
            /* @__PURE__ */ jsx("td", { class: "p-4 text-center", children: feature.fan && /* @__PURE__ */ jsx(Check, {}) }),
            /* @__PURE__ */ jsx("td", { class: "p-4 text-center", children: feature.artist && /* @__PURE__ */ jsx(Check, {}) }),
            /* @__PURE__ */ jsx("td", { class: "p-4 text-center", children: feature.publisher && /* @__PURE__ */ jsx(Check, {}) })
          ] })),
          /* @__PURE__ */ jsxs("tr", { class: "bg-surface-alt/50 dark:bg-surface-dark-alt/50", children: [
            /* @__PURE__ */ jsx("td", { class: "p-4" }),
            /* @__PURE__ */ jsx("td", { class: "p-4 text-center", children: /* @__PURE__ */ jsx("a", { href: "/auth/register?type=fan", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "md", children: "Sign up" }) }) }),
            /* @__PURE__ */ jsx("td", { class: "p-4 text-center", children: /* @__PURE__ */ jsx("a", { href: "/auth/register?type=artist", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "md", children: "Sign up" }) }) }),
            /* @__PURE__ */ jsx("td", { class: "p-4 text-center", children: /* @__PURE__ */ jsx("a", { href: "/auth/register?type=publisher", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "md", children: "Sign up" }) }) })
          ] })
        ] })
      ] }) })
    ] }) })
  );
});
const Check = () => /* @__PURE__ */ jsx(
  "svg",
  {
    class: "w-5 h-5 text-green-500 mx-auto",
    fill: "currentColor",
    viewBox: "0 0 20 20",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "fill-rule": "evenodd",
        d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
        "clip-rule": "evenodd"
      }
    )
  }
);
export {
  GET
};
