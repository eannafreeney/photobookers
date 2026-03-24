import { AuthUser } from "../../../../types";
import Modal from "../../../components/app/Modal";
import UserCoverForm from "../forms/UserCoverForm";


const UpdateUserModal = ({ user }: { user: AuthUser }) => {
  return (
    <Modal title="Update Profile">
    <UserCoverForm initialUrl={user.profileImageUrl} user={user} />
    </Modal>
  );
};

export default UpdateUserModal;