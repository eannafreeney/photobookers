import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../../schemas";
import { createRegisterFormUtils } from "./registerFormUtils";

export function registerRegisterCreatorForm() {
  Alpine.data("registerCreatorForm", () => {
    return {
      isSubmitting: false,
      isEmailChecking: false,
      fieldStatus: "",
      emailIsTaken: false,
      form: {
        email: "",
        password: "",
        confirmPassword: "",
        type: "",
        agreeToTerms: false,
      },

      errors: {
        form: {
          email: "",
          password: "",
          confirmPassword: "",
          type: "",
          agreeToTerms: false,
        },
      },
// Use common utilities
...createRegisterFormUtils(),

      get isFormValid() {
        return (
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.type &&
          this.form.email &&
          this.form.password &&
          this.form.confirmPassword &&
          this.form.confirmPassword === this.form.password &&
          this.form.agreeToTerms &&
          !this.isEmailChecking &&
          !this.emailIsTaken
        );
      },

      submitForm(event: Event) {
        this.isSubmitting = true;
        const result = registerCreatorFormSchema.safeParse(this.form);

        if (!result.success) {
          event.preventDefault();
          this.isSubmitting = false;
          this.errors.form = result.error.flatten().fieldErrors;
          return;
        }
      },

    };
  });
}