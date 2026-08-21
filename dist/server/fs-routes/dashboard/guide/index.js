import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell.js";
import CollectorDashboardShell from "../../../features/dashboard/components/CollectorDashboardShell.js";
import ProfileGuide from "../../../features/dashboard/guide/components/ProfileGuide.js";
import CollectorGuide from "../../../features/collectors/components/CollectorGuide.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import { getFlash, getUser } from "../../../utils.js";
import InfoPage from "../../../pages/InfoPage.js";
import PageHeader from "../../../components/app/PageHeader.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!user.creator) {
    return c.html(
      /* @__PURE__ */ jsx(AppLayout, { title: "Collector guide", user, flash, currentPath, children: /* @__PURE__ */ jsxs(CollectorDashboardShell, { currentPath, children: [
        /* @__PURE__ */ jsx(
          PageHeader,
          {
            title: "Getting started as a collector",
            intro: "Make your shelf public, build it out, and connect with other collectors."
          }
        ),
        /* @__PURE__ */ jsx(CollectorGuide, {})
      ] }) })
    );
  }
  const creator = user.creator;
  const [claimError, claim] = await getPendingClaim(user.id, creator.id);
  if (claimError) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: claimError.reason, user }));
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Profile guide",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsxs(
          CreatorDashboardShell,
          {
            currentPath,
            user,
            claimStatus: claim?.status ?? null,
            children: [
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  title: "Get the most out of your profile",
                  intro: "A practical checklist for building a profile that gets discovered, followed, and bought from."
                }
              ),
              /* @__PURE__ */ jsx(ProfileGuide, { creator }),
              /* @__PURE__ */ jsxs("div", { class: "mt-12 flex flex-col gap-4 border-t border-outline pt-8", children: [
                /* @__PURE__ */ jsx(
                  PageHeader,
                  {
                    title: "Your personal shelf",
                    intro: "Creators can also run a public shelf for favourites, lists, and posts."
                  }
                ),
                /* @__PURE__ */ jsx(CollectorGuide, {})
              ] })
            ]
          }
        )
      }
    )
  );
});
export {
  GET
};
