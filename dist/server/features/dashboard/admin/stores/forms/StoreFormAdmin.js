import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import Input from "../../../../../components/forms/Input.js";
import Select from "../../../../../components/forms/Select.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import CountrySelect from "../../../../../components/forms/CountrySelect.js";
const StoreFormAdmin = ({ formValues, storeId }) => {
  const isEditPage = !!storeId;
  const alpineAttrs = {
    "x-data": `storeFormAdmin(${JSON.stringify(formValues)}, ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Store Details" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        action: isEditPage ? `/dashboard/admin/stores/${storeId}` : `/dashboard/admin/stores/create`,
        method: "post",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Store Name",
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
            /* @__PURE__ */ jsx("div", { class: "md:col-span-2", children: /* @__PURE__ */ jsx(
              TextArea,
              {
                label: "Address",
                name: "form.address",
                validateInput: "validateField('address')",
                maxLength: 1e3,
                required: true
              }
            ) }),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "City",
                name: "form.city",
                maxLength: 255,
                validateInput: "validateField('city')",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(CountrySelect, { isRequired: true }),
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
              Input,
              {
                label: "Latitude",
                name: "form.latitude",
                type: "number",
                step: "any",
                validateInput: "validateField('latitude')"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                label: "Longitude",
                name: "form.longitude",
                type: "number",
                step: "any",
                validateInput: "validateField('longitude')"
              }
            ),
            /* @__PURE__ */ jsx("p", { class: "md:col-span-2 text-sm text-on-surface-weak", children: "Latitude and longitude place the store on the map view. Look up coordinates in Google Maps if needed." }),
            /* @__PURE__ */ jsx(
              Select,
              {
                label: "Status",
                name: "form.status",
                options: [
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" }
                ],
                required: true
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
var StoreFormAdmin_default = StoreFormAdmin;
export {
  StoreFormAdmin,
  StoreFormAdmin_default as default
};
