import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import StatusPill from "../../components/StatusPill.js";
const StoreApprovalForm = ({ store }) => {
  const isPending = store.approvalStatus === "pending";
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", id: "store-approval-status", children: [
    /* @__PURE__ */ jsx(StatusPill, { status: store.approvalStatus }),
    isPending && /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "form",
        {
          method: "post",
          action: `/dashboard/admin/stores/${store.id}/approve`,
          "x-target": "store-approval-status",
          children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "success", children: "Approve" })
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: `/dashboard/admin/stores/${store.id}/reject`,
          "x-target": "modal-root",
          children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "danger", children: "Reject" })
        }
      )
    ] })
  ] });
};
var StoreApprovalForm_default = StoreApprovalForm;
export {
  StoreApprovalForm_default as default
};
