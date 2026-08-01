import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm.js";
import InfoPage from "../../../pages/InfoPage.js";
import MessagesTable from "../../../features/dashboard/messages/components/MessagesTable.js";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import PageHeader from "../../../components/app/PageHeader.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  if (!user.creator)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found" }));
  const creator = user.creator;
  const [claimError, claim] = await getPendingClaim(user.id, creator.id);
  if (claimError)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: claimError.reason, user }));
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Posts", user, currentPath, children: /* @__PURE__ */ jsxs(
      CreatorDashboardShell,
      {
        currentPath,
        user,
        claimStatus: claim?.status ?? null,
        children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              title: "Your Posts",
              intro: "Share what's new with your followers."
            }
          ),
          /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-8 xl:grid-cols-3", children: [
            /* @__PURE__ */ jsx(MessageForm, { creatorId: creator.id }),
            /* @__PURE__ */ jsx("div", { class: "xl:col-span-2", children: /* @__PURE__ */ jsx(MessagesTable, { creatorId: creator.id }) })
          ] })
        ]
      }
    ) })
  );
});
export {
  GET
};
