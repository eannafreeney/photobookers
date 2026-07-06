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
import { createRegisterFormUtils } from "../../../../auth/client/registerFormUtils.js";
const CREATOR_FORM_ADMIN_FIELDS = Object.keys(creatorFormAdminSchema.shape);
function registerAddCreatorFormAdmin() {
  Alpine.data("addCreatorFormAdmin", () => {
    return {
      isSubmitting: false,
      displayNameIsTaken: false,
      websiteIsTaken: false,
      ...createFormState(CREATOR_FORM_ADMIN_FIELDS),
      ...createRegisterFormUtils(),
      init() {
        initFormValues(this, CREATOR_FORM_ADMIN_FIELDS, false);
      },
      get isDirty() {
        return getIsDirty(this, CREATOR_FORM_ADMIN_FIELDS);
      },
      validateField(field) {
        return validateField(this, field, creatorFormAdminSchema);
      },
      get isFormValid() {
        const ctx = this;
        return !!(ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.displayName && ctx.form.type && ctx.form.website && !ctx.displayNameIsTaken && !ctx.websiteIsTaken);
      },
      submitForm(event) {
        return handleSubmit(this, event, creatorFormAdminSchema);
      },
      onSuccess() {
        resetFormBaseline(this, CREATOR_FORM_ADMIN_FIELDS);
      },
      onError() {
        this.isSubmitting = false;
      }
    };
  });
}
export {
  registerAddCreatorFormAdmin
};
