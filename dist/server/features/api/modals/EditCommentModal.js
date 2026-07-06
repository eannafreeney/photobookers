import { jsx } from "hono/jsx/jsx-runtime";
import Modal from "../../../components/app/Modal.js";
import { getCommentById } from "../../app/services.js";
import CommentModal from "./CommentModal.js";
const EditCommentModal = async ({
  commentId,
  bookId,
  user
}) => {
  const [err, comment] = await getCommentById(commentId);
  if (err || !comment)
    return /* @__PURE__ */ jsx(Modal, { children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Comment not found" }) });
  const formValues = {
    body: comment.body ?? ""
  };
  return /* @__PURE__ */ jsx(
    CommentModal,
    {
      bookId,
      user,
      formValues,
      commentId
    }
  );
};
var EditCommentModal_default = EditCommentModal;
export {
  EditCommentModal_default as default
};
