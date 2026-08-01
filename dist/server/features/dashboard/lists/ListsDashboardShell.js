import { jsx } from "hono/jsx/jsx-runtime";
import CollectorDashboardShell from "../components/CollectorDashboardShell.js";
import CreatorDashboardShell from "../components/CreatorDashboardShell.js";
const ListsDashboardShell = ({
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
var ListsDashboardShell_default = ListsDashboardShell;
export {
  ListsDashboardShell_default as default
};
