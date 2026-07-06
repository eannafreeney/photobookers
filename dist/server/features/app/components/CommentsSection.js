import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import { getBookComments } from "../services.js";
import Button from "../../../components/app/Button.js";
import CommentsList from "./CommentsList.js";
const CommentsSection = async ({
  bookId,
  user,
  bookSlug,
  isMobile = false,
  commentsRefreshPath
}) => {
  const refreshPath = commentsRefreshPath ?? `/books/${bookSlug}`;
  const [err, comments] = await getBookComments(bookId);
  if (err) return /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: err.reason });
  const hasUserCommented = !!user?.id && !err && comments.some((c) => c.userId === user.id);
  const alpineAttrs = {
    "x-init": "true",
    "@comments:updated.window": `$ajax('${refreshPath}', { target: 'comments-list' })`
  };
  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: "comments-list",
      class: "flex flex-col border-t border-surface-alt",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("h3", { class: "text-base font-semibold text-on-surface-strong", children: "What did you love about this book?" }),
        /* @__PURE__ */ jsx(CommentsList, { bookId, comments, user }),
        !hasProfilePic ? /* @__PURE__ */ jsxs(
          "form",
          {
            method: "get",
            action: `/users/${user?.id}/update`,
            "x-target": "modal-root",
            class: "mt-2",
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "hidden",
                  name: "msg",
                  value: "Add a profile photo first to comment."
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  variant: "outline",
                  color: "primary",
                  width: isMobile ? "full" : "fit",
                  children: "Add Comment"
                }
              )
            ]
          }
        ) : hasUserCommented ? /* @__PURE__ */ jsx(Fragment, {}) : /* @__PURE__ */ jsx(
          Link,
          {
            href: `/api/books/${bookId}/comments`,
            xTarget: "modal-root",
            className: "mt-2",
            children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "fit", children: "Add Comment" })
          }
        )
      ]
    }
  );
};
var CommentsSection_default = CommentsSection;
export {
  CommentsSection_default as default
};
