import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import { getFollowerFeed } from "../../features/app/services.js";
import Page from "../../components/layouts/Page.js";
import InfoPage from "../../pages/InfoPage.js";
import MemberSignInPrompt, {
  memberSignInPrompts
} from "../../features/app/components/MemberSignInPrompt.js";
import FollowerFeed from "../../features/app/components/FollowerFeed.js";
import PageHeader from "../../components/app/PageHeader.js";
import { paginationRequestBaseUrl } from "../../lib/pagination.js";
import { parseFeedTab } from "../../features/app/followerFeed.js";
const kicker = "Your Feed";
const title = "From everyone you follow";
const intro = "Posts and new books from the artists, publishers, and collectors you follow.";
const tabClass = (active) => `px-3 py-2 text-sm font-medium ${active ? "border-b-2 border-accent text-on-surface-strong" : "text-on-surface-weak"}`;
const FeedTabs = ({ tab }) => /* @__PURE__ */ jsxs("div", { class: "flex gap-2", role: "tablist", children: [
  /* @__PURE__ */ jsx(
    "a",
    {
      href: "/feed?tab=posts",
      role: "tab",
      "aria-selected": tab === "posts" ? "true" : "false",
      class: tabClass(tab === "posts"),
      children: "Posts"
    }
  ),
  /* @__PURE__ */ jsx(
    "a",
    {
      href: "/feed?tab=books",
      role: "tab",
      "aria-selected": tab === "books" ? "true" : "false",
      class: tabClass(tab === "books"),
      children: "Books"
    }
  )
] });
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const tab = parseFeedTab(c.req.query("tab"));
  const currentPage = Number(c.req.query("page") ?? 1);
  if (!user) {
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Your Feed",
          user,
          flash,
          currentPath,
          noIndex: true,
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "mx-auto w-full max-w-[600px] flex flex-col gap-4", children: [
            /* @__PURE__ */ jsx(PageHeader, { kicker, title, intro }),
            /* @__PURE__ */ jsx(FeedTabs, { tab }),
            /* @__PURE__ */ jsx(
              MemberSignInPrompt,
              {
                prompt: memberSignInPrompts.feed,
                currentPath
              }
            )
          ] }) })
        }
      )
    );
  }
  const [error, result] = await getFollowerFeed(user.id, currentPage, 20, {
    tab
  });
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  }
  if (!result) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Failed to load your feed", user })
    );
  }
  const { items, totalPages, page } = result;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Your Feed",
        user,
        flash,
        currentPath,
        noIndex: true,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "mx-auto w-full max-w-[600px] flex flex-col gap-4", children: [
          /* @__PURE__ */ jsx(PageHeader, { kicker, title, intro }),
          /* @__PURE__ */ jsx(FeedTabs, { tab }),
          /* @__PURE__ */ jsx(
            FollowerFeed,
            {
              user,
              tab,
              currentPath: paginationRequestBaseUrl(c.req.url),
              items,
              totalPages,
              page
            }
          )
        ] }) })
      }
    )
  );
});
export {
  GET
};
