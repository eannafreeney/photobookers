import Alpine from "alpinejs";
import { creatorFormAdminSchema } from "../schemas.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../../client/forms/formUtils.js";
const CREATOR_FORM_FIELDS = Object.keys(creatorFormAdminSchema.shape);
function registerEditCreatorFormAdmin() {
  Alpine.data(
    "editCreatorFormAdmin",
    (formValues = {}, isEditMode = false) => {
      return {
        isSubmitting: false,
        displayNameIsTaken: false,
        ...createFormState(CREATOR_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, CREATOR_FORM_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, CREATOR_FORM_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, creatorFormAdminSchema);
        },
        get isFormValid() {
          const ctx = this;
          return ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && !ctx.displayNameIsTaken;
        },
        submitForm(event) {
          return handleSubmit(this, event, creatorFormAdminSchema);
        },
        onSuccess() {
          resetFormBaseline(this, CREATOR_FORM_FIELDS);
        },
        onError() {
          this.isSubmitting = false;
        }
      };
    }
  );
}
export {
  registerEditCreatorFormAdmin
};
