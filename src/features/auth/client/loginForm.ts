import Alpine from "alpinejs";
import { loginFormSchema } from "../schema";
import { handleSubmit } from "../../../client/forms/formUtils";

export function registerLoginForm() {
  Alpine.data("loginForm", () => {
    const params = new URLSearchParams(window.location.search);

    return {
      isSubmitting: false,
      inputType: "password" as "password" | "text",
      togglePasswordVisibility() {
        console.log("togglePasswordVisibility");
        this.inputType = this.inputType === "password" ? "text" : "password";
      },
      form: {
        email: params.get("email") ?? "",
        password: params.get("password") ?? "",
      },
      errors: {
        form: {
          email: "",
          password: "",
        },
      },

      validateField(field: string) {
        const result = loginFormSchema.safeParse(this.form);
        const fieldError =
          result.error?.flatten().fieldErrors[
            field as keyof typeof this.errors.form
          ];
        if (fieldError && fieldError[0]) {
          this.errors.form[field as keyof typeof this.errors.form] =
            fieldError[0];
        } else {
          delete this.errors.form[field as keyof typeof this.errors.form];
        }
      },

      get isFormValid() {
        return (
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.email &&
          this.form.password
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, loginFormSchema);
      },
    };
  });
}
