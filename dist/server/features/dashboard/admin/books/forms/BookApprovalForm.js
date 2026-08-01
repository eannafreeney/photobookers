import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import BookApprovalStatusPill from "../components/BookApprovalStatusPill.js";
const BookApprovalForm = ({ book }) => {
  const status = book.approvalStatus ?? "pending";
  if (status === "rejected") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(BookApprovalStatusPill, { approvalStatus: status }),
      ";",
      /* @__PURE__ */ jsx(
        "form",
        {
          method: "get",
          action: `/dashboard/admin/books/${book.id}/feedback`,
          "x-target": "modal-root",
          children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "secondary", children: "Send feedback" })
        }
      )
    ] });
  }
  if (status === "approved") {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        id: "book-approval-status",
        class: "flex flex-col md:flex-row items-center gap-2",
        children: [
          /* @__PURE__ */ jsx(BookApprovalStatusPill, { approvalStatus: status }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              method: "post",
              action: `/dashboard/admin/books/${book.id}/unapprove`,
              "x-target": `toast book-approval-status publish-toggle-${book.id}`,
              children: [
                /* @__PURE__ */ jsx(Button, { variant: "outline", color: "warning", children: "Unapprove" }),
                /* @__PURE__ */ jsx(
                  "form",
                  {
                    method: "get",
                    action: `/dashboard/admin/books/${book.id}/feedback`,
                    "x-target": "modal-root",
                    children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "secondary", children: "Send feedback" })
                  }
                )
              ]
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: "book-approval-status",
      class: "flex flex-col md:flex-row items-center gap-2",
      children: [
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
        ),
        /* @__PURE__ */ jsx(
          "form",
          {
            method: "get",
            action: `/dashboard/admin/books/${book.id}/feedback`,
            "x-target": "modal-root",
            children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "secondary", children: "Send feedback" })
          }
        )
      ]
    }
  );
};
var BookApprovalForm_default = BookApprovalForm;
export {
  BookApprovalForm_default as default
};
