import { jsx } from "hono/jsx/jsx-runtime";
const FairApprovalStatusPill = ({
  approvalStatus
}) => {
  const pillClasses = {
    pending: "bg-yellow-200 text-yellow-800",
    approved: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800"
  };
  return /* @__PURE__ */ jsx(
    "span",
    {
      class: `px-2 py-1 rounded text-xs font-medium ${pillClasses[approvalStatus]}`,
      children: approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)
    }
  );
};
var FairApprovalStatusPill_default = FairApprovalStatusPill;
export {
  FairApprovalStatusPill_default as default
};
