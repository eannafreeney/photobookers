import Alpine from "alpinejs";
import { loginFormSchema } from "../../schemas";

export function registerLoginForm() {
  Alpine.data("loginForm", () => {
    return {
      isSubmitting: false,
      form: {
        email: "",
        password: "",
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
        const result = loginFormSchema.safeParse(this.form);

        if (!result.success) {
          event.preventDefault();
          this.isSubmitting = false;

          this.errors.form = result.error.flatten().fieldErrors;
          return;
        }

        this.isSubmitting = false;
      },
    };
  });
}
