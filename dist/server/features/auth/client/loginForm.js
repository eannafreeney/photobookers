import Alpine from "alpinejs";
import { loginFormSchema } from "../schema.js";
import { handleSubmit } from "../../../client/forms/formUtils.js";
function registerLoginForm() {
  Alpine.data("loginForm", () => {
    const params = new URLSearchParams(window.location.search);
    return {
      isSubmitting: false,
      inputType: "password",
      togglePasswordVisibility() {
        console.log("togglePasswordVisibility");
        this.inputType = this.inputType === "password" ? "text" : "password";
      },
      form: {
        email: params.get("email") ?? "",
        password: params.get("password") ?? ""
      },
      errors: {
        form: {
          email: "",
          password: ""
        }
      },
      validateField(field) {
        const result = loginFormSchema.safeParse(this.form);
        const fieldError = result.error?.flatten().fieldErrors[field];
        if (fieldError && fieldError[0]) {
          this.errors.form[field] = fieldError[0];
        } else {
          delete this.errors.form[field];
        }
      },
      get isFormValid() {
        return Object.values(this.errors.form).every((err) => !err) && this.form.email && this.form.password;
      },
      submitForm(event) {
        return handleSubmit(this, event, loginFormSchema);
      }
    };
  });
}
export {
  registerLoginForm
};
