import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField
} from "../../../../client/forms/formUtils.js";
import { creatorFormSchema } from "../schema.js";
const CREATOR_FORM_FIELDS = Object.keys(creatorFormSchema.shape);
function registerEditCreatorForm() {
  Alpine.data(
    "editCreatorForm",
    (formValues = {}, isEditMode = false) => {
      return {
        isSubmitting: false,
        ...createFormState(CREATOR_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, CREATOR_FORM_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, CREATOR_FORM_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, creatorFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.displayName && ctx.form.type;
        },
        submitForm(event) {
          return handleSubmit(this, event, creatorFormSchema);
        }
      };
    }
  );
}
export {
  registerEditCreatorForm
};
