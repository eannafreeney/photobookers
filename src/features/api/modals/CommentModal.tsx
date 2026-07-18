import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import AuthModal from "../../../components/app/AuthModal";
import Modal from "../../../components/app/Modal";
import TextArea from "../../../components/forms/TextArea";

type CommentModalProps = {
  bookId: string;
  user: AuthUser | null;
  formValues?: { body: string };
  commentId?: string;
};

const CommentModal = ({
  bookId,
  user,
  formValues,
  commentId,
}: CommentModalProps) => {
  const isEditMode = !!formValues;

  const alpineAttrs = {
    "x-data": `commentForm({initialValues: ${JSON.stringify(formValues)}})`,
    "x-target": "modal-root",
    "x-target.error": "toast",
    "x-target.401": "modal-root",
    "@ajax:after": "$dispatch('comments:updated'), $dispatch('dialog:close')",
  };

  if (!user) {
    return <AuthModal action="to comment on this book." />;
  }

  return (
    <Modal title="What did you love about this book?">
      <form
        method="post"
        action={
          isEditMode
            ? `/api/books/${bookId}/comments/${commentId}`
            : `/api/books/${bookId}/comments`
        }
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        <TextArea name="body" minRows={5} required />
        <input
          type="hidden"
          name="_method"
          value={isEditMode ? "PATCH" : "POST"}
        />
        <Button
          variant="solid"
          color="primary"
          width="fit"
          isDisabled={!user.profileImageUrl}
          x-bind:disabled="!isFormValid"
        >
          {isEditMode ? "Update Comment" : "Add Comment"}
        </Button>
      </form>
    </Modal>
  );
};

export default CommentModal;
