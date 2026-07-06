import Alpine from "alpinejs";
import { createRegisterFormUtils } from "./registerFormUtils.js";
import { handleSubmit, validateField } from "../../../client/forms/formUtils.js";
import { resetPasswordFormSchema } from "../schema.js";
function registerResetPasswordForm() {
  Alpine.data("resetPasswordForm", () => {
    return {
      isSubmitting: false,
      form: {
        password: "",
        confirmPassword: ""
      },
      errors: {
        form: {
          password: "",
          confirmPassword: ""
        },
        globalError: ""
      },
      validateField(field) {
        return validateField(this, field, resetPasswordFormSchema);
      },
      // Use common utilities
      ...createRegisterFormUtils(),
      get isFormValid() {
        const ctx = this;
        return Object.values(ctx.errors.form).every((err) => !err) && ctx.form.password && ctx.form.confirmPassword && ctx.form.confirmPassword === ctx.form.password;
      },
      submitForm(event) {
        return handleSubmit(this, event, resetPasswordFormSchema);
      }
    };
  });
}
export {
  registerResetPasswordForm
};
