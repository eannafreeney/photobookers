import { log } from "console";
import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import Modal from "../../../components/app/Modal";
import UserCoverForm from "../forms/UserCoverForm";


const CreateCommentModal = ({ bookId, user }: { bookId: string, user: AuthUser | null }) => {
  
    const alpineAttrs = {
        "x-target": "modal-root",
        "x-target.error": "toast",
        "x-target.401": "modal-root",
        "@ajax:after": "dispatch('comments:updated')",
      };
  
      if (!user) {
        return <p class="text-sm text-on-surface-weak">Log in to add a comment.</p>;
      }


      console.log("bookId", bookId);
      
  
    return (   
      <Modal title="Add a Comment">
          <form
            method="post"
            action={`/api/books/${bookId}/comments`}
            class="flex flex-col gap-4"
            {...alpineAttrs}
            >
            <label
          class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary"
          >
          <textarea
            class="w-full bg-surface-alt px-2.5 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
            name="body"
            placeholder="Add a comment..."
            rows={3}
            required
            />
        </label>
            <Button variant="solid" color="primary" width="fit" isDisabled={!user.profileImageUrl}>
              Add Comment
            </Button>
          </form>         
            </Modal>
    )
}

export default CreateCommentModal