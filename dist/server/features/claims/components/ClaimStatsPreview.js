import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
const statRows = (stats) => [
  { label: "Book views (last 30 days)", value: stats.views },
  { label: "Outbound buy clicks", value: stats.outboundClicks },
  { label: "Favorited", value: stats.favorites }
];
const ClaimStatsPreview = ({ stats }) => {
  const hasActivity = statRows(stats).some((row) => row.value > 0);
  if (!hasActivity) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 rounded-radius border border-outline bg-surface p-5", children: [
    /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong", children: "Your traffic so far" }),
    /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-2", children: statRows(stats).map((row) => /* @__PURE__ */ jsxs(
      "li",
      {
        class: "list-none flex items-center justify-between gap-4 text-sm",
        children: [
          /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: row.label }),
          /* @__PURE__ */ jsx("span", { class: "select-none blur-sm", children: row.value.toLocaleString() })
        ]
      },
      row.label
    )) }),
    stats.topBookTitle && stats.topBookViews > 0 ? /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface-weak", children: [
      "Top book lately:",
      " ",
      /* @__PURE__ */ jsx("span", { class: "select-none blur-sm", children: stats.topBookTitle })
    ] }) : null,
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Claim your profile to unlock full analytics and see which books drove these clicks." })
  ] });
};
var ClaimStatsPreview_default = ClaimStatsPreview;
export {
  ClaimStatsPreview_default as default
};
