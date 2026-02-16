import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../../schemas";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit } from "./formUtils";

export function registerRegisterCreatorForm() {
  Alpine.data("registerCreatorForm", () => {
    return {
      isSubmitting: false,
      isEmailChecking: false,
      isDisplayNameChecking: false,
      isWebsiteChecking: false,
      emailAvailabilityStatus: "",
      displayNameAvailabilityStatus: "",
      websiteAvailabilityStatus: "",
      emailIsTaken: false,
      displayNameIsTaken: false,
      websiteIsTaken: false,
      _emailAbortController: null as AbortController | null,
      form: {
        displayName: "",
        website: "",
        email: "",
        password: "",
        confirmPassword: "",
        type: "",
        agreeToTerms: false,
      },

      errors: {
        form: {
          displayName: "",
          website: "",
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
          this.form.displayName &&
          this.form.website &&
          this.form.type &&
          this.form.email &&
          this.form.password &&
          this.form.confirmPassword &&
          this.form.confirmPassword === this.form.password &&
          this.form.agreeToTerms &&
          !this.isEmailChecking &&
          !this.emailIsTaken &&
          !this.isDisplayNameChecking &&
          !this.displayNameIsTaken &&
          !this.isWebsiteChecking &&
          !this.websiteIsTaken
        );
      },

      $destroy() {
        this._emailAbortController?.abort();
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, registerCreatorFormSchema);
      },
    };
  });
}
