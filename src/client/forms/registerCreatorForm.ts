import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../../features/auth/schema";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit } from "./formUtils";
import z from "zod";

type RegisterCreatorFormShape = z.infer<typeof registerCreatorFormSchema>;

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
        const ctx = this as unknown as {
          errors: { form: Record<keyof RegisterCreatorFormShape, string> };
          form: RegisterCreatorFormShape;
          isEmailChecking: boolean;
          emailIsTaken: boolean;
          isDisplayNameChecking: boolean;
          displayNameIsTaken: boolean;
          isWebsiteChecking: boolean;
          websiteIsTaken: boolean;
        };
        return (
          Object.values(ctx.errors.form).every((err) => !err) &&
          ctx.form.displayName &&
          ctx.form.website &&
          ctx.form.type &&
          ctx.form.email &&
          ctx.form.password &&
          ctx.form.confirmPassword &&
          ctx.form.confirmPassword === ctx.form.password &&
          ctx.form.agreeToTerms &&
          !ctx.isEmailChecking &&
          !ctx.emailIsTaken &&
          !ctx.isDisplayNameChecking &&
          !ctx.displayNameIsTaken &&
          !ctx.isWebsiteChecking &&
          !ctx.websiteIsTaken
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
