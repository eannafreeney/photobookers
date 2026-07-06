import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  bookIcon,
  booksIcon,
  libraryIcon,
  mailIcon,
  updatesIcon,
  usersIcon
} from "../../../lib/icons.js";
import Button from "../../../components/app/Button.js";
const REGISTER_HREF = "/auth/accounts";
const tickerItems = [
  {
    title: "Browse photobooks by artist, publisher, and tag",
    icon: booksIcon,
    href: "/books"
  },
  {
    title: "Explore our Book of the Day and weekly picks",
    icon: bookIcon,
    href: "/this-week"
  },
  {
    title: "Get updates from artists and publishers you follow",
    icon: updatesIcon,
    href: "/messages"
  },
  {
    title: "Follow your favorite artists and publishers",
    icon: usersIcon(5),
    href: REGISTER_HREF
  },
  {
    title: "Add your favorite books to your collection",
    icon: libraryIcon(5),
    href: REGISTER_HREF
  },
  {
    title: "Join the Newsletter and be updated about new books",
    icon: mailIcon(5),
    href: "/newsletter"
  }
];
const SiteFeatures = () => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 mx-auto w-full", children: tickerItems.map((item, index) => /* @__PURE__ */ jsx(FeatureCard, { item, index }, item.title)) }),
    /* @__PURE__ */ jsx("div", { class: "flex justify-center border-t border-outline pt-6", children: /* @__PURE__ */ jsx("a", { href: REGISTER_HREF, children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", children: "Create a free account" }) }) })
  ] });
};
var SiteFeatures_default = SiteFeatures;
const FeatureCard = ({ item, index }) => /* @__PURE__ */ jsxs(
  "a",
  {
    href: item.href,
    class: "border-t-2 border-on-surface-strong pt-3 flex items-center gap-4 transition hover:opacity-80",
    children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-accent shrink-0 pt-1", children: String(index + 1).padStart(2, "0") }),
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsx("span", { class: "w-5 h-5 flex items-center justify-center shrink-0 text-on-surface-strong", children: item.icon }),
        /* @__PURE__ */ jsx("span", { class: "text-sm font-medium text-on-surface-strong min-w-0 text-pretty hover:underline decoration-accent underline-offset-4", children: item.title })
      ] })
    ]
  }
);
export {
  SiteFeatures_default as default,
  tickerItems
};
