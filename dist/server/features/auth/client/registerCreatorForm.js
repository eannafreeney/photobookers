import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../schema.js";
import { createRegisterFormUtils } from "../client/registerFormUtils.js";
import { handleSubmit } from "../../../client/forms/formUtils.js";
import { ensureTurnstileScript } from "../../../client/utils/turnstile.js";
function registerRegisterCreatorForm() {
  Alpine.data("registerCreatorForm", () => {
    return {
      init() {
        ensureTurnstileScript();
      },
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
        captchaToken: ""
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
          captchaToken: ""
        }
      },
      // Use common utilities
      ...createRegisterFormUtils(),
      setCaptchaToken(token) {
        this.form.captchaToken = token;
      },
      clearCaptchaToken() {
        this.form.captchaToken = "";
      },
      get isFormValid() {
        const ctx = this;
        const noErrors = Object.values(ctx.errors.form).every((err) => !err);
        const fieldsFilled = !!ctx.form.displayName && !!ctx.form.type && !!ctx.form.email && !!ctx.form.password && !!ctx.form.confirmPassword;
        const passwordsMatch = ctx.form.confirmPassword === ctx.form.password;
        const termsChecked = ctx.form.agreeToTerms;
        const nothingTaken = !ctx.emailIsTaken && !ctx.displayNameIsTaken && (ctx.form.website ? !ctx.websiteIsTaken : true);
        return noErrors && fieldsFilled && passwordsMatch && termsChecked && nothingTaken && !!ctx.form.captchaToken;
      },
      submitForm(event) {
        return handleSubmit(this, event, registerCreatorFormSchema);
      }
    };
  });
}
export {
  registerRegisterCreatorForm
};
