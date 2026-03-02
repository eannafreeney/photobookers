import Button from "../../../../../components/app/Button";
import { User } from "../../../../../db/schema";
import CreatorsComboBox from "../components/CreatorsComboBox";

type Props = {
  users: Pick<User, "id" | "email" | "firstName" | "lastName">[];
};

const AssignOwnerForm = ({ users }: Props) => {
  return (
    <form method="post" action="/dashboard/admin/creators/edit/assign-owner">
      <CreatorsComboBox users={users} />
      <Button variant="solid" color="primary">
        Assign
      </Button>
    </form>
  );
};
export default AssignOwnerForm;
