import { jsx } from "hono/jsx/jsx-runtime";
import MemberDashboardShell from "../components/MemberDashboardShell.js";
const ListsDashboardShell = ({
  user,
  currentPath,
  claimStatus = null,
  children
}) => {
  return /* @__PURE__ */ jsx(
    MemberDashboardShell,
    {
      user,
      currentPath,
      claimStatus,
      children
    }
  );
};
var ListsDashboardShell_default = ListsDashboardShell;
export {
  ListsDashboardShell_default as default
};
