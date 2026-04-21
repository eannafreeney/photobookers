import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../schema";
import { createRegisterFormUtils } from "../client/registerFormUtils";
import { handleSubmit } from "../../../client/forms/formUtils";
import z from "zod";

type RegisterCreatorFormShape = z.infer<typeof registerCreatorFormSchema>;

export function registerRegisterCreatorForm() {
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
  Alpine.data("registerCreatorForm", () => {
    return {
      isSubmitting: false,
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
        captchaToken: "",
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
          captchaToken: "",
        },
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
          errors: { form: Record<keyof RegisterCreatorFormShape, string> };
          form: RegisterCreatorFormShape;
          emailIsTaken: boolean;
          displayNameIsTaken: boolean;
          websiteIsTaken: boolean;
        };
        const noErrors = Object.values(ctx.errors.form).every((err) => !err);
        const fieldsFilled =
          !!ctx.form.displayName &&
          !!ctx.form.type &&
          !!ctx.form.email &&
          !!ctx.form.password &&
          !!ctx.form.confirmPassword;
        const passwordsMatch = ctx.form.confirmPassword === ctx.form.password;
        const termsChecked = ctx.form.agreeToTerms;
        const nothingTaken =
          !ctx.emailIsTaken &&
          !ctx.displayNameIsTaken &&
          (ctx.form.website ? !ctx.websiteIsTaken : true);

        return (
          noErrors &&
          fieldsFilled &&
          passwordsMatch &&
          termsChecked &&
          nothingTaken &&
          !!ctx.form.captchaToken
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, registerCreatorFormSchema);
      },
    };
  });
}
