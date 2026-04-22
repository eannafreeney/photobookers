// src/features/claims/client/claimSignupForm.ts
import Alpine from "alpinejs";
import { registerAndClaimFormSchema } from "../schema";
import { createRegisterFormUtils } from "../../auth/client/registerFormUtils";
import { handleSubmit, validateField } from "../../../client/forms/formUtils";
import type { z } from "zod";

type FormShape = z.infer<typeof registerAndClaimFormSchema>;

export function registerClaimSignupForm() {
  if (
    !(window as typeof window & { __turnstileHandlersRegistered?: boolean })
      .__turnstileHandlersRegistered
  ) {
    (
      window as typeof window & { __turnstileHandlersRegistered?: boolean }
    ).__turnstileHandlersRegistered = true;

    (
      window as typeof window & { onTurnstileSuccess?: (token: string) => void }
    ).onTurnstileSuccess = (token: string) => {
      window.dispatchEvent(
        new CustomEvent("turnstile:success", { detail: { token } }),
      );
    };

    (
      window as typeof window & { onTurnstileExpired?: () => void }
    ).onTurnstileExpired = () => {
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
