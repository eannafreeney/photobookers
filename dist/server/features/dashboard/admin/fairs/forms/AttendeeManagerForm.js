import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox.js";
import { getAllCreatorOptionsForFairs } from "../services.js";
import AttendeesList from "../components/AttendeesList.js";
import Button from "../../../../../components/app/Button.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const AttendeeManagerForm = async ({
  fair,
  attendees
}) => {
  const [error, creatorOptions] = await getAllCreatorOptionsForFairs();
  if (error) {
    return /* @__PURE__ */ jsx("div", { children: "Error loading creators" });
  }
  return /* @__PURE__ */ jsxs("div", { id: "attendees", class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Attending Publishers & Artists" }),
    /* @__PURE__ */ jsx(
      FormPost,
      {
        action: `/dashboard/admin/fairs/${fair.id}/attendees`,
        "x-target": "attendees-list",
        children: /* @__PURE__ */ jsxs("div", { class: "flex gap-4 items-end mb-4", children: [
          /* @__PURE__ */ jsx("div", { class: "flex-1", children: /* @__PURE__ */ jsx(
            OptionsComboBox,
            {
              label: "Add Creators",
              name: "creatorId",
              options: creatorOptions,
              multiple: true
            }
          ) }),
          /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "auto", children: "Add Attendees" })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        id: "attendees-list",
        ...{ "@attendees:updated.window": "$ajax($el.dataset.refreshUrl)" },
        children: /* @__PURE__ */ jsx(AttendeesList, { attendees, fairId: fair.id })
      }
    )
  ] });
};
var AttendeeManagerForm_default = AttendeeManagerForm;
export {
  AttendeeManagerForm_default as default
};
