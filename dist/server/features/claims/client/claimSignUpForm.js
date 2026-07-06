import Alpine from "alpinejs";
import { registerAndClaimFormSchema } from "../schema.js";
import { createRegisterFormUtils } from "../../auth/client/registerFormUtils.js";
import { handleSubmit, validateField } from "../../../client/forms/formUtils.js";
import { ensureTurnstileScript } from "../../../client/utils/turnstile.js";
function registerClaimSignupForm() {
  Alpine.data("claimSignupForm", () => ({
    init() {
      ensureTurnstileScript();
    },
    isSubmitting: false,
    emailIsTaken: false,
    form: {
      firstName: "",
      lastName: "",
      email: "",
      type: "fan",
      agreeToTerms: false,
      verificationUrl: "",
      captchaToken: ""
    },
    errors: {
      form: {
        firstName: "",
        lastName: "",
        email: "",
        agreeToTerms: false,
        verificationUrl: "",
        captchaToken: ""
      },
      globalError: ""
    },
    validateField(field) {
      return validateField(this, field, registerAndClaimFormSchema);
    },
    ...createRegisterFormUtils(),
    setCaptchaToken(token) {
      this.form.captchaToken = token;
    },
    clearCaptchaToken() {
      this.form.captchaToken = "";
    },
    get isFormValid() {
      const ctx = this;
      return Object.values(ctx.errors.form).every((err) => !err) && ctx.form.firstName && ctx.form.lastName && ctx.form.email && ctx.form.agreeToTerms && !!ctx.form.captchaToken && !ctx.emailIsTaken;
    },
    submitForm(event) {
      return handleSubmit(this, event, registerAndClaimFormSchema);
    }
  }));
}
export {
  registerClaimSignupForm
};
