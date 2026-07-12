import AssignOwnerForm from "../forms/AssignOwnerForm";
import { User } from "../../../../../db/schema";

type Props = {
  users: Pick<User, "id" | "email" | "firstName" | "lastName">[];
  creatorId: string;
};

const AssignOwnerModalContent = ({ users, creatorId }: Props) => {
  return (
    <div id="assign-owner-content">
      <AssignOwnerForm users={users} creatorId={creatorId} />
    </div>
  );
};
export default AssignOwnerModalContent;
