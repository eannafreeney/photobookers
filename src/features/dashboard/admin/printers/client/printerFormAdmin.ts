import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";
import { printerFormAdminSchema } from "../schema";

const PRINTER_FORM_FIELDS = [
  "name",
  "email",
  "description",
  "specialties",
  "languages",
  "city",
  "country",
  "website",
  "latitude",
  "longitude",
  "status",
  "sort_order",
];

export function registerPrinterFormAdmin() {
  Alpine.data("printerFormAdmin", (formValues: any, isEditMode: boolean) => {
    return {
      ...createFormState(PRINTER_FORM_FIELDS, formValues),
      isSubmitting: false,
      isEditMode,

      init() {
        initFormValues(this, PRINTER_FORM_FIELDS, isEditMode);
      },

      get isDirty() {
        return getIsDirty(this, PRINTER_FORM_FIELDS);
      },

      get isFormValid() {
        const ctx = this as any;
        return (
          ctx.isDirty &&
          Object.values(ctx.errors.form).every((err: unknown) => !err) &&
          ctx.form.name &&
          ctx.form.email &&
          ctx.form.city &&
          ctx.form.country
        );
      },

      validateField(field: string) {
        return validateField(this, field, printerFormAdminSchema);
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, printerFormAdminSchema);
      },

      onSuccess() {
        const ctx = this as any;
        if (!ctx.isEditMode) {
          resetFormBaseline(this, PRINTER_FORM_FIELDS);
        }
      },
    };
  });
}
