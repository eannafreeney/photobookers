import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import { User } from "../../../../../db/schema";

type Props = {
  users: Pick<User, "id" | "email" | "firstName" | "lastName">[];
};

const UsersComboBox = ({ users }: Props) => {
  const options = users.map((user) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    const label = name ? `${name} (${user.email})` : user.email;

    return {
      id: user.id,
      label,
      img: null,
    };
  });

  return (
    <OptionsComboBox options={options} name="userId" label="User" required />
  );
};

export default UsersComboBox;
