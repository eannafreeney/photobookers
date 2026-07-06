import Alpine from "alpinejs";
import { createMessageFormSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../client/forms/formUtils.js";
const MESSAGE_FORM_FIELDS = Object.keys(createMessageFormSchema.shape);
function registerMessageForm() {
  Alpine.data("messageForm", (formValues = {}) => {
    return {
      isSubmitting: false,
      isDragOver: false,
      previewUrl: null,
      ...createFormState(MESSAGE_FORM_FIELDS, formValues),
      init() {
        initFormValues(this, MESSAGE_FORM_FIELDS, false);
      },
      get isDirty() {
        return getIsDirty(this, MESSAGE_FORM_FIELDS);
      },
      validateField(field) {
        return validateField(this, field, createMessageFormSchema);
      },
      get isFormValid() {
        const ctx = this;
        return getIsDirty(ctx, MESSAGE_FORM_FIELDS) && Object.values(ctx.errors.form).every((err) => !err) && !!ctx.form.body;
      },
      submitForm(event) {
        return handleSubmit(this, event, createMessageFormSchema);
      },
      onSuccess() {
        resetFormBaseline(this, MESSAGE_FORM_FIELDS);
      },
      onDragEnter(e) {
        const ctx = this;
        e.preventDefault();
        ctx.isDragOver = true;
      },
      onDragOver(e) {
        const ctx = this;
        e.preventDefault();
        ctx.isDragOver = true;
      },
      onDragLeave(e) {
        const ctx = this;
        e.preventDefault();
        ctx.isDragOver = false;
      },
      onDrop(e) {
        const ctx = this;
        e.preventDefault();
        ctx.isDragOver = false;
        const uri = e.dataTransfer?.getData("text/uri-list")?.trim();
        if (!uri) return;
        const current = (ctx.form.imageUrls ?? "").trim();
        ctx.form.imageUrls = current ? `${current}, ${uri}` : uri;
      },
      onFileChange(e) {
        const ctx = this;
        const file = e.target.files?.[0];
        if (!file) return;
        if (ctx.previewUrl) URL.revokeObjectURL(ctx.previewUrl);
        ctx.previewUrl = URL.createObjectURL(file);
      }
    };
  });
}
export {
  registerMessageForm
};
