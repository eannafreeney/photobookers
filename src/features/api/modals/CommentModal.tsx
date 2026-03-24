import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import Modal from "../../../components/app/Modal";

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
    return <p class="text-sm text-on-surface-weak">Log in to add a comment.</p>;
  }

  return (
    <Modal title="What did you love about this book?">
      <form
        method="post"
        action={
          isEditMode
            ? `/api/books/${bookId}/update/${commentId}`
            : `/api/books/${bookId}/comments`
        }
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        <label class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
          <textarea
            class="w-full bg-surface-alt px-2.5 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
            name="body"
            rows={isEditMode ? 8 : 3}
            x-model="body"
            required
          />
        </label>
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
