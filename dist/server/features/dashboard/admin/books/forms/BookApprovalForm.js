import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import BookApprovalStatusPill from "../components/BookApprovalStatusPill.js";
const BookApprovalForm = ({ book }) => {
  const status = book.approvalStatus ?? "pending";
  const isPending = status === "pending";
  if (!isPending) {
    return /* @__PURE__ */ jsx(BookApprovalStatusPill, { approvalStatus: status });
  }
  return /* @__PURE__ */ jsxs("div", { id: "book-approval-status", class: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx(
      "form",
      {
        method: "post",
        action: `/dashboard/admin/books/${book.id}/approve`,
        "x-target": "toast book-approval-status",
        children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "success", children: "Approve" })
      }
    ),
    /* @__PURE__ */ jsx(
      "form",
      {
        method: "get",
        action: `/dashboard/admin/books/${book.id}/reject`,
        "x-target": "modal-root",
        children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", children: "Reject" })
      }
    )
  ] });
};
var BookApprovalForm_default = BookApprovalForm;
export {
  BookApprovalForm_default as default
};
