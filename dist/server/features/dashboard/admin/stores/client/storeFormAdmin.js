import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../../client/forms/formUtils.js";
import { storeFormAdminSchema } from "../schema.js";
const STORE_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "address",
  "city",
  "country",
  "website",
  "latitude",
  "longitude",
  "status",
  "sort_order"
];
function registerStoreFormAdmin() {
  Alpine.data("storeFormAdmin", (formValues, isEditMode) => {
    return {
      ...createFormState(STORE_FORM_FIELDS, formValues),
      isSubmitting: false,
      isEditMode,
      init() {
        initFormValues(this, STORE_FORM_FIELDS, isEditMode);
      },
      get isDirty() {
        return getIsDirty(this, STORE_FORM_FIELDS);
      },
      get isFormValid() {
        const ctx = this;
        return ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.name && ctx.form.slug && ctx.form.address && ctx.form.city && ctx.form.country;
      },
      validateField(field) {
        return validateField(this, field, storeFormAdminSchema);
      },
      submitForm(event) {
        return handleSubmit(this, event, storeFormAdminSchema);
      },
      onSuccess() {
        const ctx = this;
        if (!ctx.isEditMode) {
          resetFormBaseline(this, STORE_FORM_FIELDS);
        }
      }
    };
  });
}
export {
  registerStoreFormAdmin
};
