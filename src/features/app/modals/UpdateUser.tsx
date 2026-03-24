import { AuthUser } from "../../../../types";
import Modal from "../../../components/app/Modal";
import UserCoverForm from "../forms/UserCoverForm";

type Props = {
  user: AuthUser;
  msg: string | undefined;
};

const UpdateUserModal = ({ user, msg }: Props) => {
  const title = msg ? msg : "Update Profile Image";
  return (
    <Modal title={title}>
      <UserCoverForm initialUrl={user.profileImageUrl} user={user} />
    </Modal>
  );
};

export default UpdateUserModal;
