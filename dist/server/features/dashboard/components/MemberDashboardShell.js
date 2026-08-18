import { jsx } from "hono/jsx/jsx-runtime";
import CollectorDashboardShell from "./CollectorDashboardShell.js";
import CreatorDashboardShell from "./CreatorDashboardShell.js";
const MemberDashboardShell = ({
  user,
  currentPath,
  claimStatus = null,
  children
}) => {
  if (user.creator) {
    return /* @__PURE__ */ jsx(
      CreatorDashboardShell,
      {
        currentPath,
        user,
        claimStatus,
        children
      }
    );
  }
  return /* @__PURE__ */ jsx(CollectorDashboardShell, { currentPath, children });
};
var MemberDashboardShell_default = MemberDashboardShell;
export {
  MemberDashboardShell_default as default
};
