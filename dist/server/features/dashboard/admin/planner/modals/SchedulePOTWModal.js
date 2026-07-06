import { jsx } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import POTWForm from "../forms/POTWForm.js";
import { getCreatorsByTypeForPlanner } from "../services.js";
const SchedulePublisherOfTheWeekModal = async ({ week, formValues }) => {
  const creators = await getCreatorsByTypeForPlanner("publisher");
  const options = creators.map((c) => ({
    id: c.id,
    label: c.displayName,
    img: c.coverUrl ?? null,
    verified: c.status === "verified"
  }));
  return /* @__PURE__ */ jsx(Modal, { title: `Publisher of the Week for ${week}`, children: /* @__PURE__ */ jsx(POTWForm, { options, week, formValues }) });
};
var SchedulePOTWModal_default = SchedulePublisherOfTheWeekModal;
export {
  SchedulePOTWModal_default as default
};
