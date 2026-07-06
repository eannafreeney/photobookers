import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Page from "../../../components/layouts/Page.js";
import NavTabs from "../books/components/NavTabs.js";
import VerifiedCreatorShareBanner from "../books/components/VerifiedCreatorShareBanner.js";
import VerificationStatusBanner from "./VerificationStatusBanner.js";
const CreatorDashboardShell = ({
  children,
  currentPath,
  user,
  claimStatus
}) => {
  const creator = user.creator;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      VerificationStatusBanner,
      {
        claimStatus,
        creatorStatus: creator.status ?? "stub"
      }
    ),
    creator.status === "verified" && /* @__PURE__ */ jsx(VerifiedCreatorShareBanner, { creator }),
    /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(
        NavTabs,
        {
          currentPath,
          creatorId: creator.id,
          showProfile: creator.status === "verified"
        }
      ),
      /* @__PURE__ */ jsx("div", { id: "creator-dashboard-panel", "x-merge": "replace", children })
    ] })
  ] });
};
var CreatorDashboardShell_default = CreatorDashboardShell;
export {
  CreatorDashboardShell_default as default
};
