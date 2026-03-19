// src/features/claims/client/claimSignupForm.ts
import Alpine from "alpinejs";
import { registerAndClaimFormSchema } from "../schema";
import { createRegisterFormUtils } from "../../auth/client/registerFormUtils";
import { handleSubmit, validateField } from "../../../client/forms/formUtils";
import type { z } from "zod";

type FormShape = z.infer<typeof registerAndClaimFormSchema>;

export function registerClaimSignupForm() {
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
      },
      globalError: "",
    },
    validateField(field: string) {
      return validateField(this, field, registerAndClaimFormSchema);
    },
    ...createRegisterFormUtils(),
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
        !ctx.emailIsTaken
      );
    },
    submitForm(event: Event) {
      return handleSubmit(this, event, registerAndClaimFormSchema);
    },
  }));
}
