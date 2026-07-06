import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import ComboBox from "../../../../../components/forms/ComboBox.js";
import DateInput from "../../../../../components/forms/DateInput.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import Input from "../../../../../components/forms/Input.js";
import RadioFields from "../../../../../components/forms/RadioFields.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import { getAllCreatorOptions } from "../../creators/services.js";
const BookFormAdmin = async ({ formValues, bookId }) => {
  const artistOptions = await getAllCreatorOptions("artist");
  const publisherOptions = await getAllCreatorOptions("publisher");
  const isEditPage = !!bookId;
  const alpineAttrs = {
    "x-data": `bookFormAdmin(
      ${JSON.stringify(formValues)}, 
      ${JSON.stringify(artistOptions)}, 
      ${JSON.stringify(publisherOptions)},
      ${isEditPage},
    )`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4 ", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Book Details" }),
    /* @__PURE__ */ jsx(
      "form",
      {
        action: isEditPage ? `/dashboard/admin/books/${bookId}` : `/dashboard/admin/books/create`,
        method: "post",
        ...alpineAttrs,
        children: /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Title",
              name: "form.title",
              maxLength: 100,
              validateInput: "validateField('title')",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            ComboBox,
            {
              label: "Artist",
              name: "form.artist_id",
              newOptionName: "form.new_artist_name",
              type: "artist",
              options: artistOptions,
              disableOnInit: false,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            ComboBox,
            {
              label: "Publisher",
              name: "form.publisher_id",
              newOptionName: "form.new_publisher_name",
              type: "publisher",
              options: publisherOptions,
              disableOnInit: false
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "Description",
              name: "form.description",
              validateInput: "validateField('description')",
              maxLength: 5e3
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Purchase Link",
              name: "form.purchase_link",
              type: "url",
              validateInput: "validateField('purchase_link')"
            }
          ),
          /* @__PURE__ */ jsx(
            DateInput,
            {
              label: "Release Date",
              name: "form.release_date",
              validateInput: "validateField('release_date')"
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              label: "Tags",
              name: "form.tags",
              placeholder: "photography, landscape, Japan (comma-separated)"
            }
          ),
          /* @__PURE__ */ jsx(
            RadioFields,
            {
              label: "Status",
              name: "form.availability_status",
              validateInput: "validateField('availability_status')",
              options: [
                { value: "available", label: "Available" },
                { value: "sold_out", label: "Sold Out" },
                { value: "unavailable", label: "Unavailable" }
              ]
            }
          ),
          /* @__PURE__ */ jsx(FormButtons, {})
        ] })
      }
    )
  ] });
};
export {
  BookFormAdmin
};
