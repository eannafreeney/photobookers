// NewUserCredentialsModal.tsx (new file in modals/)
import Modal from "../../../../../components/app/Modal";
import CopyCellCol from "../../../../../components/app/CopyCellCol";

type Props = {
  email: string;
  temporaryPassword: string;
};

const NewUserCredentialsModal = ({ email, temporaryPassword }: Props) => {
  const loginUrl = "https://photobookers.com/auth/login";
  const credentialsText = `Login: ${loginUrl}\nEmail: ${email}\nPassword: ${temporaryPassword}`;
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
        <CopyCellCol entity={credentialsText} buttonWidth="full" />
      </div>
    </Modal>
  );
};

export default NewUserCredentialsModal;
