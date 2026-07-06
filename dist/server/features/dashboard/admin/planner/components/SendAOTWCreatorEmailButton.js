import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { toWeekString } from "../../../../../lib/utils.js";
import ToggleButton from "./ToggleButton.js";
const SendAOTWCreatorEmailButton = ({ artistOfTheWeek, creatorId }) => {
  const isSent = Boolean(artistOfTheWeek.emailSentAt);
  const id = `aotw-email-${artistOfTheWeek.id}-artist`;
  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error": "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      id,
      action: `/dashboard/admin/planner/artist-of-the-week/send-creator-email`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "creatorId", value: creatorId }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "weekStart",
            value: toWeekString(artistOfTheWeek.weekStart)
          }
        ),
        /* @__PURE__ */ jsx(ToggleButton, { isSent, recipientType: "artist" })
      ]
    }
  );
};
var SendAOTWCreatorEmailButton_default = SendAOTWCreatorEmailButton;
export {
  SendAOTWCreatorEmailButton_default as default
};
