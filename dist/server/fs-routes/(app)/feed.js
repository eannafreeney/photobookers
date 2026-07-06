import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import { getFeedBooks } from "../../features/app/services.js";
import Page from "../../components/layouts/Page.js";
import InfoPage from "../../pages/InfoPage.js";
import MemberSignInPrompt, {
  memberSignInPrompts
} from "../../features/app/components/MemberSignInPrompt.js";
import BooksGrid from "../../features/app/components/BooksGrid.js";
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
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Your Feed",
                title: "From Creators You Follow",
                intro: "The latest books from the artists and publishers you follow."
              }
            ),
            /* @__PURE__ */ jsx(
              MemberSignInPrompt,
              {
                prompt: memberSignInPrompts.feed,
                currentPath
              }
            )
          ] })
        }
      )
    );
  }
  const [error, result] = await getFeedBooks(user.id, currentPage);
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  }
  if (!result?.books) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "No books found by your followees", user })
    );
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Books",
        user,
        flash,
        currentPath,
        noIndex: true,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Your Feed",
              title: "From Creators You Follow",
              intro: "The latest books from the artists and publishers you follow."
            }
          ),
          /* @__PURE__ */ jsx(
            BooksGrid,
            {
              user,
              currentPath,
              result,
              noResultsMessage: "Start following artists and publishers to see their latest releases here."
            }
          )
        ] })
      }
    )
  );
});
export {
  GET
};
