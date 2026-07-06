import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import StatusPill from "../../components/StatusPill.js";
const FairApprovalForm = ({ fair }) => {
  const isPending = fair.approvalStatus === "pending";
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", id: "fair-approval-status", children: [
    /* @__PURE__ */ jsx(StatusPill, { status: fair.approvalStatus }),
    isPending && /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "form",
        {
          method: "post",
          action: `/dashboard/admin/fairs/${fair.id}/approve`,
          "x-target": "fair-approval-status",
          children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "success", children: "Approve" })
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `/dashboard/admin/fairs/${fair.id}/reject`,
          "x-target": "modal-root",
          children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "danger", children: "Reject" })
        }
      )
    ] })
  ] });
};
var FairApprovalForm_default = FairApprovalForm;
export {
  FairApprovalForm_default as default
};
