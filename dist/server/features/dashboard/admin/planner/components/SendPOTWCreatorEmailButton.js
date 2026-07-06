import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { toWeekString } from "../../../../../lib/utils.js";
import ToggleButton from "./ToggleButton.js";
const SendPOTWCreatorEmailButton = ({
  publisherOfTheWeek,
  creatorId
}) => {
  const isSent = Boolean(publisherOfTheWeek.emailSentAt);
  const id = `potw-email-${publisherOfTheWeek.id}-publisher`;
  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error": "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      id,
      action: `/dashboard/admin/planner/publisher-of-the-week/send-creator-email`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "creatorId", value: creatorId }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "weekStart",
            value: toWeekString(publisherOfTheWeek.weekStart)
          }
        ),
        /* @__PURE__ */ jsx(ToggleButton, { isSent, recipientType: "publisher" })
      ]
    }
  );
};
var SendPOTWCreatorEmailButton_default = SendPOTWCreatorEmailButton;
export {
  SendPOTWCreatorEmailButton_default as default
};
