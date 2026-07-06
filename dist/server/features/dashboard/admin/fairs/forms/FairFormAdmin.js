import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import DateInput from "../../../../../components/forms/DateInput.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import Input from "../../../../../components/forms/Input.js";
import Select from "../../../../../components/forms/Select.js";
import TextArea from "../../../../../components/forms/TextArea.js";
const FairFormAdmin = ({ formValues, fairId }) => {
  const isEditPage = !!fairId;
  const alpineAttrs = {
    "x-data": `fairFormAdmin(${JSON.stringify(formValues)}, ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Fair Details" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        action: isEditPage ? `/dashboard/admin/fairs/${fairId}` : `/dashboard/admin/fairs/create`,
        method: "post",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Fair Name",
                name: "form.name",
                maxLength: 200,
                validateInput: "validateField('name')",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Slug",
                name: "form.slug",
                maxLength: 255,
                validateInput: "validateField('slug')",
                required: true
              }
            ),
            /* @__PURE__ */ jsx("div", { class: "md:col-span-2", children: /* @__PURE__ */ jsx(
              TextArea,
              {
                label: "Description",
                name: "form.description",
                validateInput: "validateField('description')",
                maxLength: 5e3
              }
            ) }),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "City",
                name: "form.city",
                maxLength: 255,
                validateInput: "validateField('city')"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Country",
                name: "form.country",
                maxLength: 255,
                validateInput: "validateField('country')"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Venue",
                name: "form.venue",
                validateInput: "validateField('venue')"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Website",
                name: "form.website",
                type: "url",
                validateInput: "validateField('website')"
              }
            ),
            /* @__PURE__ */ jsx(
              DateInput,
              {
                label: "Start Date",
                name: "form.start_date",
                validateInput: "validateField('start_date')",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              DateInput,
              {
                label: "End Date",
                name: "form.end_date",
                validateInput: "validateField('end_date')",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              Select,
              {
                label: "Status",
                name: "form.status",
                options: [
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "cancelled", label: "Cancelled" }
                ],
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              Select,
              {
                label: "Listing Tier",
                name: "form.listing_tier",
                options: [
                  { value: "free", label: "Free" },
                  { value: "promoted", label: "Promoted" }
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Sort Order",
                name: "form.sort_order",
                type: "number",
                validateInput: "validateField('sort_order')"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(FormButtons, {})
        ]
      }
    )
  ] });
};
var FairFormAdmin_default = FairFormAdmin;
export {
  FairFormAdmin,
  FairFormAdmin_default as default
};
