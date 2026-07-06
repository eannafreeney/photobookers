import Alpine from "alpinejs";
import { forgotPasswordFormSchema } from "../schema.js";
import { handleSubmit } from "../../../client/forms/formUtils.js";
function registerForgotPasswordForm() {
  Alpine.data("forgotPasswordForm", () => {
    return {
      isSubmitting: false,
      form: {
        email: ""
      },
      errors: {
        form: {
          email: ""
        }
      },
      validateField(field) {
        const result = forgotPasswordFormSchema.safeParse(this.form);
        const fieldError = result.error?.flatten().fieldErrors[field];
        if (fieldError && fieldError[0]) {
          this.errors.form[field] = fieldError[0];
        } else {
          this.errors.form[field] = "";
        }
      },
      get isFormValid() {
        return Object.values(this.errors.form).every((err) => !err) && this.form.email;
      },
      submitForm(event) {
        return handleSubmit(this, event, forgotPasswordFormSchema);
      }
    };
  });
}
export {
  registerForgotPasswordForm
};
