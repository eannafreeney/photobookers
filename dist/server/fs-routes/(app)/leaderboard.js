import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import { getContributorLeaderboard } from "../../domain/contributors/services.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
function displayName(entry) {
  return [entry.firstName, entry.lastName].filter(Boolean).join(" ") || "Anonymous";
}
const LeaderboardRow = ({ entry, rank }) => /* @__PURE__ */ jsxs(
  "a",
  {
    href: entry.shelfSlug ? `/shelf/${entry.shelfSlug}?tab=contributions` : void 0,
    class: "flex items-center justify-between gap-4 border-t border-outline py-3 hover:bg-surface-alt/50 px-2 -mx-2 rounded transition-colors",
    children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("span", { class: "text-2xl font-display font-medium text-on-surface-weak w-8 text-right", children: rank }),
        entry.profileImageUrl ? /* @__PURE__ */ jsx(
          "img",
          {
            src: entry.profileImageUrl,
            alt: "",
            class: "w-10 h-10 rounded-full object-cover"
          }
        ) : /* @__PURE__ */ jsx("div", { class: "w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-on-surface-weak text-sm font-medium", children: (entry.firstName?.[0] ?? "?").toUpperCase() }),
        /* @__PURE__ */ jsx("span", { class: "font-medium text-on-surface-strong", children: displayName(entry) })
      ] }),
      /* @__PURE__ */ jsxs("span", { class: "text-sm text-on-surface-weak", children: [
        entry.bookCount,
        " book",
        entry.bookCount !== 1 ? "s" : ""
      ] })
    ]
  }
);
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const leaderboard = await getContributorLeaderboard();
  const title = pageTitle("Contributors");
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description: "People who contribute books to Photobookers",
        canonicalUrl: canonicalUrl(c.req.url, "/leaderboard"),
        currentPath,
        user,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Community",
              title: "Contributors",
              intro: "These people help grow the Photobookers catalog by submitting books for review."
            }
          ),
          leaderboard.length > 0 ? /* @__PURE__ */ jsx("div", { class: "flex flex-col mt-8 max-w-xl", children: leaderboard.map((entry, i) => /* @__PURE__ */ jsx(LeaderboardRow, { entry, rank: i + 1 })) }) : /* @__PURE__ */ jsx("p", { class: "text-on-surface-weak mt-8", children: "No contributors yet." })
        ] })
      }
    )
  );
});
export {
  GET
};
