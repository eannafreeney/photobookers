import { jsx } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import AOTWForm from "../forms/AOTWForm.js";
import { getCreatorsByTypeForPlanner } from "../services.js";
const ScheduleAOTWModal = async ({ week, formValues }) => {
  const creators = await getCreatorsByTypeForPlanner("artist");
  const options = creators.map((c) => ({
    id: c.id,
    label: c.displayName,
    img: c.coverUrl ?? null,
    verified: c.status === "verified"
  }));
  return /* @__PURE__ */ jsx(Modal, { title: `Artist of the Week for ${week}`, children: /* @__PURE__ */ jsx(AOTWForm, { options, week, formValues }) });
};
var ScheduleAOTWModal_default = ScheduleAOTWModal;
export {
  ScheduleAOTWModal_default as default
};
