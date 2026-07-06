import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Fragment } from "hono/jsx/jsx-runtime";
const tickerItems = [
  "Discover New Photobooks",
  "Join the Newsletter",
  "Follow Your Favorite Artists and Publishers",
  "Create a Profile",
  "Book of The Day",
  "Artist of The Week",
  "Publisher of The Week",
  "Follow on Instagram",
  "Wishlist Your Favorite Books",
  "Collect Your Favorite Books",
  "Share Your Favorite Books"
];
function TickerBanner() {
  const doubled = [...tickerItems, ...tickerItems];
  return /* @__PURE__ */ jsx("div", { class: "relative left-1/2 -translate-x-1/2 w-screen overflow-hidden mt-3 md:mt-0 border-b border-outline", children: /* @__PURE__ */ jsx("div", { class: "marquee flex w-max items-center gap-2 whitespace-nowrap py-1 text-sm", children: doubled.map((item, idx) => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { class: "text-on-surface tracking-wide", children: item }),
    idx < doubled.length - 1 && /* @__PURE__ */ jsx("span", { class: "text-on-surface/50", children: "\u2022" })
  ] }, `${item}-${idx}`)) }) });
}
export {
  TickerBanner as default,
  tickerItems
};
