import Alpine from "alpinejs";
import { editUserFormAdminSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../../client/forms/formUtils.js";
const EDIT_USER_FORM_FIELDS = Object.keys(editUserFormAdminSchema.shape);
function registerEditUserFormAdmin() {
  Alpine.data(
    "editUserFormAdmin",
    (formValues = {}, isEditMode = false) => {
      return {
        isSubmitting: false,
        ...createFormState(EDIT_USER_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, EDIT_USER_FORM_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, EDIT_USER_FORM_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, editUserFormAdminSchema);
        },
        get isFormValid() {
          const ctx = this;
          return ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && !!ctx.form.email;
        },
        submitForm(event) {
          return handleSubmit(this, event, editUserFormAdminSchema);
        },
        onSuccess() {
          this.isSubmitting = false;
          resetFormBaseline(this, EDIT_USER_FORM_FIELDS);
        },
        onError() {
          this.isSubmitting = false;
        }
      };
    }
  );
}
export {
  registerEditUserFormAdmin
};
