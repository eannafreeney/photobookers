import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatDate } from "../../../../utils.js";
function submitterDisplayName(user) {
  if (!user) return null;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}
const Credits = ({ releaseDate, submittedByUser }) => {
  const submitterName = submitterDisplayName(submittedByUser ?? null);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col border-t-2 border-on-surface-strong", children: [
    /* @__PURE__ */ jsx("span", { class: "kicker text-accent pt-3 pb-2", children: "Colophon" }),
    releaseDate && /* @__PURE__ */ jsxs("div", { class: "flex items-baseline justify-between gap-4 border-t border-outline py-2", children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak", children: "Released" }),
      /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface-strong", children: formatDate(releaseDate) })
    ] }),
    submitterName && /* @__PURE__ */ jsxs("div", { class: "flex items-baseline justify-between gap-4 border-t border-outline py-2", children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak", children: "Added by" }),
      /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface-strong", children: submittedByUser?.shelfSlug ? /* @__PURE__ */ jsx(
        "a",
        {
          href: `/shelf/${submittedByUser.shelfSlug}?tab=contributions`,
          class: "underline hover:text-accent",
          children: submitterName
        }
      ) : submitterName })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-baseline justify-between gap-4 border-t border-outline py-2", children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak", children: "Credits" }),
      /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface text-right max-w-xs", children: "All images on this page are owned by the respective creator." })
    ] })
  ] });
};
var BookCredits_default = Credits;
export {
  BookCredits_default as default
};
