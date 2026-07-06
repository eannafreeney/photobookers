import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Select from "../../../../../components/forms/Select.js";
import ValidateDisplayName from "../../../../auth/components/ValidateDisplayName.js";
import ValidateWebsite from "../../../../auth/components/ValidateWebsite.js";
import Input from "../../../../../components/forms/Input.js";
const AddCreatorFormAdmin = () => {
  const alpineAttrs = {
    "x-data": `addCreatorFormAdmin()`,
    "x-target": "creators-table add-creator-form",
    "x-target.error": "toast",
    "x-target.away": "_top",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)",
    "x-on:displayName-availability.window": "displayNameIsTaken = !$event.detail.displayNameIsAvailable",
    "x-on:website-availability.window": "websiteIsTaken = !$event.detail.websiteIsAvailable"
  };
  return /* @__PURE__ */ jsxs("div", { id: "add-creator-form", class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Create Creator" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        action: "/dashboard/admin/creators/create",
        method: "post",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-2", children: [
            /* @__PURE__ */ jsx(ValidateDisplayName, {}),
            /* @__PURE__ */ jsx(ValidateWebsite, {}),
            /* @__PURE__ */ jsx(Input, { label: "Email", name: "form.email", type: "email" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                label: "Type",
                name: "form.type",
                options: [
                  { label: "Artist", value: "artist" },
                  { label: "Publisher", value: "publisher" }
                ],
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(FormButtons, {})
        ]
      }
    )
  ] });
};
var AddCreatorFormAdmin_default = AddCreatorFormAdmin;
export {
  AddCreatorFormAdmin_default as default
};
