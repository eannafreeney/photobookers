import Alpine from "alpinejs";
import { artistOfTheWeekFormSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField
} from "../../../../../client/forms/formUtils.js";
const AOTW_FIELDS = Object.keys(artistOfTheWeekFormSchema.shape);
function registerAOTWForm() {
  Alpine.data("aotwForm", () => {
    return {
      isSubmitting: false,
      ...createFormState(AOTW_FIELDS),
      init() {
        initFormValues(this, AOTW_FIELDS);
      },
      get isDirty() {
        return getIsDirty(this, AOTW_FIELDS);
      },
      validateField(field) {
        return validateField(this, field, artistOfTheWeekFormSchema);
      },
      get isFormValid() {
        const ctx = this;
        return Object.values(ctx.errors.form).every((err) => !err) && ctx.form.creatorId;
      },
      submitForm(event) {
        return handleSubmit(this, event, artistOfTheWeekFormSchema);
      }
    };
  });
}
export {
  registerAOTWForm
};
