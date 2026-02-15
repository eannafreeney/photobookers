import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../../schemas";
import { createRegisterFormUtils } from "./registerFormUtils";

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
        console.log(this);

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
