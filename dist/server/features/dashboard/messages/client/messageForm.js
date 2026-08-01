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
  Alpine.data("messageForm", (config = {}) => {
    const { previewUrl: initialPreviewUrl, ...formValues } = config;
    return {
      isSubmitting: false,
      isDragOver: false,
      previewUrl: initialPreviewUrl ?? null,
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
        const file = Array.from(e.dataTransfer?.files ?? []).find(
          (f) => f.type.startsWith("image/")
        );
        if (!file) return;
        const input = this.$refs?.fileInput;
        if (input) {
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
        }
        if (ctx.previewUrl) URL.revokeObjectURL(ctx.previewUrl);
        ctx.previewUrl = URL.createObjectURL(file);
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
