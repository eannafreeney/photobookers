import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm.js";
import InfoPage from "../../../pages/InfoPage.js";
import CreatorMessages from "../../../features/app/components/CreatorMessages.js";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell.js";
import { getPendingClaim } from "../../../features/claims/services.js";
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
    /* @__PURE__ */ jsx(AppLayout, { title: "Posts", user, currentPath, children: /* @__PURE__ */ jsx(
      CreatorDashboardShell,
      {
        currentPath,
        user,
        claimStatus: claim?.status ?? null,
        children: /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsx(MessageForm, { creatorId: creator.id }),
          /* @__PURE__ */ jsx(CreatorMessages, { creatorSlug: creator.slug, user })
        ] })
      }
    ) })
  );
});
export {
  GET
};
