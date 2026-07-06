import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import ComboBox from "../../../../components/forms/ComboBox.js";
import DateInput from "../../../../components/forms/DateInput.js";
import FormButtons from "../../../../components/forms/FormButtons.js";
import Input from "../../../../components/forms/Input.js";
import RadioFields from "../../../../components/forms/RadioFields.js";
import TextArea from "../../../../components/forms/TextArea.js";
import ToggleInput from "../../../../components/forms/ToggleInput.js";
import { getAllCreatorOptions } from "../../admin/creators/services.js";
import FormPost from "../../../../components/forms/FormPost.js";
const BookForm = async ({
  formValues,
  isPublisher,
  bookId,
  action,
  primaryAction = "save"
}) => {
  const artistOptions = isPublisher ? await getAllCreatorOptions("artist") : [];
  const publisherOptions = !isPublisher ? await getAllCreatorOptions("publisher") : [];
  const isEditPage = !!bookId;
  const isArtist = !isPublisher;
  const mergedFormValues = {
    ...formValues ?? {},
    intent: isPublisher ? "publisher" : "artist"
  };
  const alpineAttrs = {
    "x-data": `bookForm(
      ${JSON.stringify(mergedFormValues)}, 
      ${JSON.stringify(artistOptions)}, 
      ${JSON.stringify(publisherOptions)},
      ${isArtist},
      ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4 ", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Book Details" }),
    /* @__PURE__ */ jsx(FormPost, { action, ...alpineAttrs, children: /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
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
      isPublisher && !isEditPage && /* @__PURE__ */ jsx(
        ComboBox,
        {
          label: "Artist",
          name: "form.artist_id",
          newOptionName: "form.new_artist_name",
          type: "artist",
          options: artistOptions,
          required: true
        }
      ),
      isArtist && !isEditPage ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { "x-show": "is_self_published", children: /* @__PURE__ */ jsx(
          ToggleInput,
          {
            label: "Self Published",
            name: "is_self_published",
            isChecked: isArtist
          }
        ) }),
        /* @__PURE__ */ jsx("div", { "x-show": "!is_self_published", children: /* @__PURE__ */ jsx(
          ComboBox,
          {
            label: "Publisher",
            name: "form.publisher_id",
            newOptionName: "form.new_publisher_name",
            type: "publisher",
            options: publisherOptions,
            required: true
          }
        ) })
      ] }) : /* @__PURE__ */ jsx(Fragment, {}),
      /* @__PURE__ */ jsx(
        TextArea,
        {
          label: "Description",
          name: "form.description",
          validateInput: "validateField('description')",
          maxLength: 5e3,
          minRows: 5,
          required: true
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
          validateInput: "validateField('release_date')",
          required: true
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
      !isEditPage && /* @__PURE__ */ jsx(
        ToggleInput,
        {
          label: "Send email to followers on release date",
          name: "form.send_email_to_followers_on_release",
          isChecked: false,
          disabledBinding: "!form.release_date || new Date(form.release_date + 'T23:59:59') < new Date()"
        }
      ),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", "x-model": "form.intent" }),
      /* @__PURE__ */ jsx(
        FormButtons,
        {
          buttonText: primaryAction === "submit_for_review" ? "Submit for review" : "Save",
          loadingText: primaryAction === "submit_for_review" ? "Submitting\u2026" : "Saving\u2026"
        }
      )
    ] }) })
  ] });
};
export {
  BookForm
};
