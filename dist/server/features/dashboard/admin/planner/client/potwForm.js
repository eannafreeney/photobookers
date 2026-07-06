import Alpine from "alpinejs";
import { publisherOfTheWeekFormSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField
} from "../../../../../client/forms/formUtils.js";
const POTW_FIELDS = Object.keys(publisherOfTheWeekFormSchema.shape);
function registerPOTWForm() {
  Alpine.data(
    "potwForm",
    (formValues, isEditMode = false) => {
      return {
        isSubmitting: false,
        ...createFormState(POTW_FIELDS, formValues),
        init() {
          initFormValues(this, POTW_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, POTW_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, publisherOfTheWeekFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err) && ctx.form.creatorId;
        },
        submitForm(event) {
          return handleSubmit(this, event, publisherOfTheWeekFormSchema);
        }
      };
    }
  );
}
export {
  registerPOTWForm
};
