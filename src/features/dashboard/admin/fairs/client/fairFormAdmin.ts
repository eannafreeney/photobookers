import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";
import { fairFormAdminSchema } from "../schema";

const FAIR_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "city",
  "country",
  "venue",
  "website",
  "start_date",
  "end_date",
  "status",
  "listing_tier",
  "sort_order",
];

export function registerFairFormAdmin() {
  Alpine.data("fairFormAdmin", (formValues: any, isEditMode: boolean) => {
    return {
      ...createFormState(FAIR_FORM_FIELDS, formValues),
      isSubmitting: false,
      isEditMode,

      init() {
        initFormValues(this, FAIR_FORM_FIELDS, isEditMode);
      },

      get isDirty() {
        return getIsDirty(this, FAIR_FORM_FIELDS);
      },

      get isFormValid() {
        const ctx = this as any;
        return (
          ctx.isDirty &&
          Object.values(ctx.errors.form).every((err) => !err) &&
          ctx.form.name &&
          ctx.form.slug
        );
      },

      validateField(field: string) {
        return validateField(this, field, fairFormAdminSchema);
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, fairFormAdminSchema);
      },

      onSuccess() {
        const ctx = this as any;
        if (!ctx.isEditMode) {
          resetFormBaseline(this, FAIR_FORM_FIELDS);
        }
      },
    };
  });
}
