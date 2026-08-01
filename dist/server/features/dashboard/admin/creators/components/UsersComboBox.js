import { jsx } from "hono/jsx/jsx-runtime";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox.js";
const UsersComboBox = ({ users }) => {
  const options = users.map((user) => {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    const label = name ? `${name} (${user.email})` : user.email;
    return {
      id: user.id,
      label,
      img: null
    };
  });
  return /* @__PURE__ */ jsx(OptionsComboBox, { options, name: "userId", label: "User", required: true });
};
var UsersComboBox_default = UsersComboBox;
export {
  UsersComboBox_default as default
};
