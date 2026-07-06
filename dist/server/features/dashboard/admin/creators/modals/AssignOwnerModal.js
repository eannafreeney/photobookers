import { jsx } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
const AssignOwnerModal = ({ creatorName, creatorId }) => {
  return /* @__PURE__ */ jsx(Modal, { title: `Assign User as Owner of creator: ${creatorName}`, children: /* @__PURE__ */ jsx(
    "div",
    {
      id: "assign-owner-content",
      class: "h-24",
      "x-init": `$ajax('/dashboard/admin/creators/assign-owner-content/${creatorId}')`,
      children: "...loading content..."
    }
  ) });
};
var AssignOwnerModal_default = AssignOwnerModal;
export {
  AssignOwnerModal_default as default
};
