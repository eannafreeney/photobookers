import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { normalizeStoredDate, toDateString } from "../../../../../lib/utils.js";
import { formatDayLabel } from "../utils.js";
import ToggleButton from "./ToggleButton.js";
const SendBOTDCreatorEmailButton = ({
  recipientType,
  bookOfTheDay,
  creatorId,
  bookId
}) => {
  const emailSentAt = recipientType === "artist" ? bookOfTheDay.artistEmailSentAt : bookOfTheDay.publisherEmailSentAt;
  const isSent = Boolean(emailSentAt);
  const id = `botd-email-${bookOfTheDay.id}-${recipientType}`;
  const botdDay = normalizeStoredDate(bookOfTheDay.date);
  const botdDateLabel = formatDayLabel(botdDay);
  const alpineAttrs = {
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:error": "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      id,
      action: `/dashboard/admin/planner/book-of-the-day/send-creator-email`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "creatorId", value: creatorId }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "recipientType", value: recipientType }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "date", value: toDateString(botdDay) }),
        /* @__PURE__ */ jsx(
          ToggleButton,
          {
            isSent,
            recipientType,
            botdDateLabel
          }
        )
      ]
    }
  );
};
var SendBOTDCreatorEmailButton_default = SendBOTDCreatorEmailButton;
export {
  SendBOTDCreatorEmailButton_default as default
};
