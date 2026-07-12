import Button from "../../../../../components/app/Button";
import { User } from "../../../../../db/schema";
import UsersComboBox from "../components/UsersComboBox";

type Props = {
  users: Pick<User, "id" | "email" | "firstName" | "lastName">[];
  creatorId: string;
};

const AssignOwnerForm = ({ users, creatorId }: Props) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:after":
      "$dispatch('dialog:close'), $dispatch('creators:updated')",
  };

  return (
    <form
      {...alpineAttrs}
      method="post"
      action={`/dashboard/admin/creators/assign-owner/${creatorId}`}
      class="w-full flex flex-col gap-4"
    >
      <UsersComboBox users={users} />
      <Button variant="solid" color="primary">
        Assign
      </Button>
    </form>
  );
};
export default AssignOwnerForm;
