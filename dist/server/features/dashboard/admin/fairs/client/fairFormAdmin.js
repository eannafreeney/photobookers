import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../../client/forms/formUtils.js";
import { fairFormAdminSchema } from "../schema.js";
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
  "sort_order"
];
function registerFairFormAdmin() {
  Alpine.data("fairFormAdmin", (formValues, isEditMode) => {
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
        const ctx = this;
        return ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.name && ctx.form.slug;
      },
      validateField(field) {
        return validateField(this, field, fairFormAdminSchema);
      },
      submitForm(event) {
        return handleSubmit(this, event, fairFormAdminSchema);
      },
      onSuccess() {
        const ctx = this;
        if (!ctx.isEditMode) {
          resetFormBaseline(this, FAIR_FORM_FIELDS);
        }
      }
    };
  });
}
export {
  registerFairFormAdmin
};
