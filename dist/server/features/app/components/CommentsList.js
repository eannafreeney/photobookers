import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import CardCreatorCard from "../../../components/app/CardCreatorCard.js";
import Link from "../../../components/app/Link.js";
import FormDelete from "../../../components/forms/FormDelete.js";
import { formatDate } from "../../../utils.js";
import { getDisplayName } from "../services.js";
const CommentsList = async ({ bookId, user, comments }) => {
  if (comments.length === 0)
    return /* @__PURE__ */ jsx("p", { class: "text-sm text-center text-on-surface border border-outline rounded-radius p-4 bg-surface-alt my-2", children: "No comments yet. Be the first to comment!" });
  return /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-2 w-full my-4", children: comments.map((comment) => {
    const creator = comment.user?.creators?.[0] ?? null;
    return /* @__PURE__ */ jsxs("div", { class: "border-b border-outline pb-2", children: [
      /* @__PURE__ */ jsxs("div", { class: "mb-2 flex items-center justify-between gap-2", children: [
        creator ? /* @__PURE__ */ jsx(CardCreatorCard, { creator }) : /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: comment.user?.profileImageUrl ?? "",
              alt: getDisplayName(comment.user),
              class: "h-6 w-6 rounded-full object-cover"
            }
          ),
          /* @__PURE__ */ jsx("p", { class: "text-sm font-medium text-on-surface-strong", children: getDisplayName(comment.user) })
        ] }),
        comment.createdAt && /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface", children: formatDate(comment.createdAt) })
      ] }),
      /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsx(CommentBody, { body: comment.body }),
        user?.id === comment.userId && /* @__PURE__ */ jsx("div", { class: "flex items-center gap-2 text-xs text-on-surface cursor-pointer", children: /* @__PURE__ */ jsx(
          Link,
          {
            href: `/api/books/${bookId}/comments/${comment.id}`,
            xTarget: "modal-root",
            hoverUnderline: true,
            children: "edit"
          }
        ) })
      ] })
    ] }, comment.id);
  }) });
};
var CommentsList_default = CommentsList;
const CommentBody = ({ body }) => /* @__PURE__ */ jsxs("div", { "x-data": "{ expanded: false }", class: "text-sm text-on-surface pr-2", children: [
  /* @__PURE__ */ jsxs("p", { "x-show": `!expanded && ${body.length} > 130 `, children: [
    body.slice(0, 130),
    "..."
  ] }),
  /* @__PURE__ */ jsx("p", { "x-show": `expanded || ${body.length} <= 130`, children: body }),
  body.length > 130 && /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      class: "mt-1 text-xs text-on-surface hover:underline cursor-pointer",
      "x-on:click": "expanded = !expanded",
      "x-text": "expanded ? 'Show less' : 'Show more'"
    }
  )
] });
const DeleteCommentButton = async ({
  commentId,
  bookId
}) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('div').remove()"
  };
  return /* @__PURE__ */ jsx(
    FormDelete,
    {
      action: `/api/books/${bookId}/comments/${commentId}`,
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx("button", { class: "cursor-pointer hover:underline", type: "submit", children: /* @__PURE__ */ jsx("span", { class: "text-xs text-on-surface", children: "delete" }) })
    }
  );
};
export {
  CommentsList_default as default
};
