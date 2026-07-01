import Alpine from "alpinejs";
import { registerFanFormSchema } from "../schema";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit, validateField } from "../../../client/forms/formUtils";
import { ensureTurnstileScript } from "../../../client/utils/turnstile";
import z from "zod";

type RegisterFanFormShape = z.infer<typeof registerFanFormSchema>;

export function registerRegisterFanForm() {
  Alpine.data("registerFanForm", () => {
    return {
      init() {
        ensureTurnstileScript();
      },
      isSubmitting: false,
      emailIsTaken: false,
      form: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        type: "fan",
        agreeToTerms: false,
        captchaToken: "",
      },

      errors: {
        form: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
          captchaToken: "",
        },
        globalError: "",
      },

      validateField(field: string) {
        return validateField(this, field, registerFanFormSchema);
      },
      // Use common utilities
      ...createRegisterFormUtils(),

      setCaptchaToken(token: string) {
        this.form.captchaToken = token;
      },

      clearCaptchaToken() {
        this.form.captchaToken = "";
      },

      get isFormValid() {
        const ctx = this as unknown as {
          errors: { form: Record<keyof RegisterFanFormShape, string> };
          form: RegisterFanFormShape;
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
          !!ctx.form.captchaToken &&
          !ctx.emailIsTaken
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, registerFanFormSchema);
      },
    };
  });
}
