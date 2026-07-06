import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField
} from "../../../../../client/forms/formUtils.js";
import { createRegisterFormUtils } from "../../../../auth/client/registerFormUtils.js";
import { newUserFormAdminSchema } from "../schema.js";
import { creatorFormAdminSchema } from "../../creators/schemas.js";
const NEW_USER_FORM_FIELDS = Object.keys(newUserFormAdminSchema.shape);
function registerNewUserForm() {
  Alpine.data("newUserForm", () => {
    return {
      isSubmitting: false,
      emailIsTaken: false,
      ...createFormState(NEW_USER_FORM_FIELDS),
      ...createRegisterFormUtils(),
      init() {
        initFormValues(this, NEW_USER_FORM_FIELDS, false);
      },
      get isDirty() {
        return getIsDirty(this, NEW_USER_FORM_FIELDS);
      },
      validateField(field) {
        return validateField(this, field, newUserFormAdminSchema);
      },
      get isFormValid() {
        const ctx = this;
        return !!(ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && !ctx.emailIsTaken && ctx.form.email);
      },
      submitForm(event) {
        return handleSubmit(this, event, creatorFormAdminSchema);
      }
    };
  });
}
export {
  registerNewUserForm
};
