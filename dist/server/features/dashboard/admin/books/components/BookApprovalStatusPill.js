import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import { capitalize } from "../../../../../utils.js";
const BookApprovalStatusPill = ({ approvalStatus = "pending" }) => {
  return /* @__PURE__ */ jsx("div", { id: "book-approval-status", class: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
    Pill,
    {
      variant: approvalStatus === "approved" ? "success" : approvalStatus === "rejected" ? "danger" : "warning",
      children: capitalize(approvalStatus)
    }
  ) });
};
var BookApprovalStatusPill_default = BookApprovalStatusPill;
export {
  BookApprovalStatusPill_default as default
};
