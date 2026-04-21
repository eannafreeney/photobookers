// src/features/claims/client/claimSignupForm.ts
import Alpine from "alpinejs";
import { registerAndClaimFormSchema } from "../schema";
import { createRegisterFormUtils } from "../../auth/client/registerFormUtils";
import { handleSubmit, validateField } from "../../../client/forms/formUtils";
import type { z } from "zod";

type FormShape = z.infer<typeof registerAndClaimFormSchema>;

export function registerClaimSignupForm() {
  if (!(window as any).__turnstileHandlersRegistered) {
    (window as any).__turnstileHandlersRegistered = true;
    (window as any).onTurnstileSuccess = (token: string) => {
      window.dispatchEvent(
        new CustomEvent("turnstile:success", { detail: { token } }),
      );
    };
    (window as any).onTurnstileExpired = () => {
      window.dispatchEvent(new CustomEvent("turnstile:expired"));
    };
  }
  Alpine.data("claimSignupForm", () => ({
    isSubmitting: false,
    emailIsTaken: false,
    form: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      type: "fan" as const,
      agreeToTerms: false,
      verificationUrl: "",
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
        verificationUrl: "",
        captchaToken: "",
      },
      globalError: "",
    },

    validateField(field: string) {
      return validateField(this, field, registerAndClaimFormSchema);
    },

    ...createRegisterFormUtils(),

    setCaptchaToken(token: string) {
      this.form.captchaToken = token;
    },

    clearCaptchaToken() {
      this.form.captchaToken = "";
    },

    get isFormValid() {
      const ctx = this as unknown as {
        errors: { form: Record<keyof FormShape, string> };
        form: FormShape;
        emailIsTaken: boolean;
      };
      return (
        Object.values(ctx.errors.form).every((err) => !err) &&
        ctx.form.firstName &&
        ctx.form.lastName &&
        ctx.form.email &&
        ctx.form.password &&
        ctx.form.confirmPassword === ctx.form.password &&
        ctx.form.agreeToTerms &&
        !!ctx.form.captchaToken &&
        !ctx.emailIsTaken
      );
    },

    submitForm(event: Event) {
      return handleSubmit(this, event, registerAndClaimFormSchema);
    },
  }));
}
