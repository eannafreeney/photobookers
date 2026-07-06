import { jsx } from "hono/jsx/jsx-runtime";
import Modal from "../../../components/app/Modal.js";
import UserCoverForm from "../forms/UserCoverForm.js";
const UpdateUserModal = ({ user, msg }) => {
  const title = msg ? msg : "Update Profile Image";
  return /* @__PURE__ */ jsx(Modal, { title, children: /* @__PURE__ */ jsx(UserCoverForm, { initialUrl: user.profileImageUrl, user }) });
};
var UpdateUser_default = UpdateUserModal;
export {
  UpdateUser_default as default
};
