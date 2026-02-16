import Alpine from "alpinejs";
import { registerFanFormSchema } from "../../schemas";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit, validateField } from "./formUtils";

export function registerRegisterFanForm() {
  Alpine.data("registerFanForm", () => {
    return {
      isSubmitting: false,
      isEmailChecking: false,
      emailAvailabilityStatus: "",
      emailIsTaken: false,
      _emailAbortController: null as AbortController | null,
      form: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        type: "fan",
        agreeToTerms: false,
      },

      errors: {
        form: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
        },
        globalError: "",
      },

      validateField(field: string) {
        return validateField(this, field, registerFanFormSchema);
      },
      // Use common utilities
      ...createRegisterFormUtils(),

      get isFormValid() {
        return (
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.firstName &&
          this.form.lastName &&
          this.form.email &&
          this.form.password &&
          this.form.confirmPassword &&
          this.form.confirmPassword === this.form.password &&
          this.form.agreeToTerms &&
          !this.isEmailChecking &&
          !this.emailIsTaken
        );
      },

      $destroy() {
        this._emailAbortController?.abort();
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, registerFanFormSchema);
      },
    };
  });
}
