import Alpine from "alpinejs";
import { resetPasswordFormSchema } from "../../schemas";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit, validateField } from "./formUtils";

export function registerResetPasswordForm() {
  Alpine.data("resetPasswordForm", () => {
    return {
      isSubmitting: false,
      form: {
        password: "",
        confirmPassword: "",
      },

      errors: {
        form: {
          password: "",
          confirmPassword: "",
        },
        globalError: "",
      },

      validateField(field: string) {
        return validateField(this, field, resetPasswordFormSchema);
      },
      // Use common utilities
      ...createRegisterFormUtils(),

      get isFormValid() {
        return (
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.password &&
          this.form.confirmPassword &&
          this.form.confirmPassword === this.form.password
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, resetPasswordFormSchema);
      },
    };
  });
}
