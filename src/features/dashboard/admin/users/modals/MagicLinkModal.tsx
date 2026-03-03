import CopyCellCol from "../../../../../components/app/CopyCellCol";
import Button from "../../../../../components/app/Button";
import Modal from "../../../../../components/app/Modal";
import { User } from "../../../../../db/schema";

type Props = {
  userId: string;
  errorMessage: string | null;
  actionLink: string | null;
  user: User | null;
};

const MagicLinkModal = ({ userId, errorMessage, actionLink, user }: Props) => {
  return (
    <Modal title="Generate Magic Link">
      {errorMessage && <div class="text-red-500">{errorMessage}</div>}
      {!actionLink && <div class="text-red-500">Error sending magic link</div>}
      {actionLink && (
        <div class="flex flex-col gap-4 items-center justify-center">
          <p>Magic link Generated</p>
          <div class="flex flex-col gap-2 w-full">
            {/* <form
              x-target="toast"
              method="post"
              action={`/dashboard/admin/users/${userId}/send-magic-link`}
            >
              <input type="hidden" name="actionLink" value={actionLink} />
              <Button variant="solid" color="primary">
                Send to {user?.firstName} {user?.lastName}
              </Button>
            </form> */}
            <CopyCellCol entity={actionLink} buttonWidth="full" />
          </div>
        </div>
      )}
    </Modal>
  );
};
export default MagicLinkModal;
