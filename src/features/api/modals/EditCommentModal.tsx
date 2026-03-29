import { AuthUser } from "../../../../types";
import Modal from "../../../components/app/Modal";
import { getCommentById } from "../../app/services";
import CommentModal from "./CommentModal";

type EditCommentModalProps = {
  commentId: string;
  bookId: string;
  user: AuthUser | null;
};

const EditCommentModal = async ({
  commentId,
  bookId,
  user,
}: EditCommentModalProps) => {
  const [err, comment] = await getCommentById(commentId);

  if (err || !comment)
    return (
      <Modal>
        <p class="text-sm text-on-surface">Comment not found</p>
      </Modal>
    );

  const formValues = {
    body: comment.body ?? "",
  };

  return (
    <CommentModal
      bookId={bookId}
      user={user}
      formValues={formValues}
      commentId={commentId}
    />
  );
};

export default EditCommentModal;
