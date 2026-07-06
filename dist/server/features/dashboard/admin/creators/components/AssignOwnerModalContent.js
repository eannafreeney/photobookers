import { jsx } from "hono/jsx/jsx-runtime";
import AssignOwnerForm from "../forms/AssignOwnerForm.js";
const AssignOwnerModalContent = ({ users, creatorId }) => {
  return /* @__PURE__ */ jsx("div", { id: "assign-owner-content", class: "h-24", children: /* @__PURE__ */ jsx(AssignOwnerForm, { users, creatorId }) });
};
var AssignOwnerModalContent_default = AssignOwnerModalContent;
export {
  AssignOwnerModalContent_default as default
};
