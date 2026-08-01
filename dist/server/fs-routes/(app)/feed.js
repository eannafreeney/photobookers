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
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
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
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "mx-auto w-full max-w-[600px]", children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Your Feed",
                title: "From creators you follow",
                intro: "The latest books and announcements from the artists and publishers you follow."
              }
            ),
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
  const [error, result] = await getFollowerFeed(user.id, currentPage);
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
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Your Feed",
              title: "From creators you follow",
              intro: "The latest books and announcements from the artists and publishers you follow."
            }
          ),
          /* @__PURE__ */ jsx(
            FollowerFeed,
            {
              user,
              currentPath,
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
