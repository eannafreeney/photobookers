import Alpine from "alpinejs";
import { registerFanFormSchema } from "../schema.js";
import { createRegisterFormUtils } from "./registerFormUtils.js";
import { handleSubmit, validateField } from "../../../client/forms/formUtils.js";
import { ensureTurnstileScript } from "../../../client/utils/turnstile.js";
function registerRegisterFanForm() {
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
        captchaToken: ""
      },
      errors: {
        form: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
          captchaToken: ""
        },
        globalError: ""
      },
      validateField(field) {
        return validateField(this, field, registerFanFormSchema);
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
        return Object.values(ctx.errors.form).every((err) => !err) && ctx.form.firstName && ctx.form.lastName && ctx.form.email && ctx.form.password && ctx.form.confirmPassword && ctx.form.confirmPassword === ctx.form.password && ctx.form.agreeToTerms && !!ctx.form.captchaToken && !ctx.emailIsTaken;
      },
      submitForm(event) {
        return handleSubmit(this, event, registerFanFormSchema);
      }
    };
  });
}
export {
  registerRegisterFanForm
};
