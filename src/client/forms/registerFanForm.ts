import Alpine from "alpinejs";
import { registerFanFormSchema } from "../../features/auth/schema";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit, validateField } from "./formUtils";
import z from "zod";

type RegisterFanFormShape = z.infer<typeof registerFanFormSchema>;

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
        const ctx = this as unknown as {
          errors: { form: Record<keyof RegisterFanFormShape, string> };
          form: RegisterFanFormShape;
          isEmailChecking: boolean;
          emailIsTaken: boolean;
        };
        return (
          Object.values(ctx.errors.form).every((err) => !err) &&
          ctx.form.firstName &&
          ctx.form.lastName &&
          ctx.form.email &&
          ctx.form.password &&
          ctx.form.confirmPassword &&
          ctx.form.confirmPassword === ctx.form.password &&
          ctx.form.agreeToTerms &&
          !ctx.isEmailChecking &&
          !ctx.emailIsTaken
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
