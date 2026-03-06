// NewUserCredentialsModal.tsx (new file in modals/)
import Modal from "../../../../../components/app/Modal";
import CopyCellCol from "../../../../../components/app/CopyCellCol";
import { Creator } from "../../../../../db/schema";

type Props = {
  email: string;
  temporaryPassword: string;
  creator?: Creator;
};

const NewUserCredentialsModal = ({
  email,
  temporaryPassword,
  creator,
}: Props) => {
  console.log("creator", creator);
  const credentialsText = `https://photobookers.com/auth/login?email=${email}&password=${temporaryPassword}`;
  return (
    <Modal title="User created – send these credentials">
      <div class="flex flex-col gap-2">
        <div class="text-sm">
          <span class="font-medium">Email:</span> {email}
        </div>
        <div class="text-sm">
          <span class="font-medium">Temporary password:</span>{" "}
          <code class="bg-base-200 px-1 rounded">{temporaryPassword}</code>
        </div>
        {creator && (
          <div class="text-sm">
            <span class="font-medium">Assigned to Creator:</span>{" "}
            <code class="bg-base-200 px-1 rounded">{creator?.displayName}</code>
          </div>
        )}
        <CopyCellCol entity={credentialsText} buttonWidth="full" />
      </div>
    </Modal>
  );
};

export default NewUserCredentialsModal;
