import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Input from "../../../../../components/forms/Input.js";
import { toDateString, toWeekString } from "../../../../../lib/utils.js";
const SetCreatorEmailModal = ({
  creatorId,
  bookId,
  recipientType,
  weekStart,
  date,
  action,
  targetId
}) => {
  const alpineAttrs = {
    "x-target": `${targetId} toast modal-root`,
    "x-target.error": "toast",
    "x-target.401": "modal-root",
    "@ajax:after": "$dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-strong", children: "No email found for this creator. Please update the creator's email." }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action,
        class: "flex flex-col gap-3",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx(Input, { label: "Email", type: "email", name: "form.email" }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "creatorId", value: creatorId }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId ?? "" }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "recipientType", value: recipientType ?? "" }),
          weekStart && /* @__PURE__ */ jsx(
            "input",
            {
              type: "hidden",
              name: "weekStart",
              value: toWeekString(weekStart)
            }
          ),
          date && /* @__PURE__ */ jsx("input", { type: "hidden", name: "date", value: toDateString(date) }),
          /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Submit" })
        ]
      }
    )
  ] });
};
var SetCreatorEmailModal_default = SetCreatorEmailModal;
export {
  SetCreatorEmailModal_default as default
};
