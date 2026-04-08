import Alpine from "alpinejs";
import { createMessageFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../client/forms/formUtils";
type MessageFormData = z.infer<typeof createMessageFormSchema>;

const MESSAGE_FORM_FIELDS = Object.keys(createMessageFormSchema.shape);

type MessageFormCtx = {
  isSubmitting: boolean;
  isDragOver: boolean;
  previewUrl: string | null;
  form: Partial<MessageFormData> & Record<string, any>;
  errors: { form: Record<string, string> };
};

export function registerMessageForm() {
  Alpine.data("messageForm", (formValues: Partial<MessageFormData> = {}) => {
    return {
      isSubmitting: false,
      isDragOver: false,
      previewUrl: null as string | null,

      ...createFormState(MESSAGE_FORM_FIELDS, formValues),

      init() {
        initFormValues(this, MESSAGE_FORM_FIELDS, false);
      },

      get isDirty() {
        return getIsDirty(this, MESSAGE_FORM_FIELDS);
      },

      validateField(field: string) {
        return validateField(this, field, createMessageFormSchema);
      },

      get isFormValid() {
        const ctx = this as unknown as MessageFormCtx;
        return (
          getIsDirty(ctx, MESSAGE_FORM_FIELDS) &&
          Object.values(ctx.errors.form).every((err) => !err) &&
          !!ctx.form.body
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, createMessageFormSchema);
      },

      onSuccess() {
        resetFormBaseline(this, MESSAGE_FORM_FIELDS);
      },

      onDragEnter(e: DragEvent) {
        const ctx = this as unknown as MessageFormCtx;
        e.preventDefault();
        ctx.isDragOver = true;
      },

      onDragOver(e: DragEvent) {
        const ctx = this as unknown as MessageFormCtx;
        e.preventDefault();
        ctx.isDragOver = true;
      },

      onDragLeave(e: DragEvent) {
        const ctx = this as unknown as MessageFormCtx;
        e.preventDefault();
        ctx.isDragOver = false;
      },

      onDrop(e: DragEvent) {
        const ctx = this as unknown as MessageFormCtx;
        e.preventDefault();
        ctx.isDragOver = false;
        const uri = e.dataTransfer?.getData("text/uri-list")?.trim();
        if (!uri) return;
        const current = (ctx.form.imageUrls ?? "").trim();
        ctx.form.imageUrls = current ? `${current}, ${uri}` : uri;
      },

      onFileChange(e: Event) {
        const ctx = this as unknown as MessageFormCtx;
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        if (ctx.previewUrl) URL.revokeObjectURL(ctx.previewUrl);
        ctx.previewUrl = URL.createObjectURL(file);
      },
    };
  });
}
