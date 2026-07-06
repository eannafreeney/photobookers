import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils.js";
import MemberSignInPrompt, {
  memberSignInPrompts
} from "../../features/app/components/MemberSignInPrompt.js";
import { getMessagesForFollower } from "../../features/app/services.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import InfoPage from "../../pages/InfoPage.js";
import CreatorMessage from "../../features/app/components/CreatorMessage.js";
import ListNavigation from "../../features/app/components/ListNavigation.js";
import PageHeader from "../../components/app/PageHeader.js";
const MessagesHeader = () => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4", children: [
  /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Your Messages" }),
  /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium text-on-surface-strong", children: "Updates from creators you follow" })
] });
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
          title: "Updates",
          user,
          flash,
          currentPath,
          noIndex: true,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Your Messages",
                title: "Updates from creators you follow",
                intro: "Notes and announcements from artists and publishers appear here. Sign up to follow creators and stay in the loop."
              }
            ),
            /* @__PURE__ */ jsx(
              MemberSignInPrompt,
              {
                prompt: memberSignInPrompts.messages,
                currentPath
              }
            )
          ] })
        }
      )
    );
  }
  const [error, result] = await getMessagesForFollower(user.id, currentPage);
  if (error)
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Failed to get messages for follower" })
    );
  const { messages, totalPages, page } = result;
  const targetId = `messages-list`;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Updates",
        user,
        flash,
        currentPath,
        noIndex: true,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { id: targetId, class: "flex w-full flex-col gap-4", children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Your Messages",
              title: "Updates from creators you follow",
              intro: "Notes and announcements from artists and publishers appear here. Sign up to follow creators and stay in the loop."
            }
          ),
          messages.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-on-surface", children: "Messages from creators you follow will appear here." }) : messages.map((msg, index) => /* @__PURE__ */ jsx(
            CreatorMessage,
            {
              user,
              isFollower: true,
              creator: msg.creator,
              message: msg,
              isFirst: index === 0
            }
          )),
          /* @__PURE__ */ jsx(
            ListNavigation,
            {
              isInfiniteScroll: true,
              targetId,
              totalPages,
              page,
              currentPath
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
