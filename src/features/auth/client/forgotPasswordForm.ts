import Alpine from "alpinejs";
import { forgotPasswordFormSchema } from "../schema";
import { handleSubmit } from "../../../client/forms/formUtils";

export function registerForgotPasswordForm() {
  Alpine.data("forgotPasswordForm", () => {
    return {
      isSubmitting: false,
      form: {
        email: "",
      },
      errors: {
        form: {
          email: "",
        },
      },

      validateField(field: string) {
        const result = forgotPasswordFormSchema.safeParse(this.form);
        const fieldError =
          result.error?.flatten().fieldErrors[
            field as keyof typeof this.errors.form
          ];
        if (fieldError && fieldError[0]) {
          this.errors.form[field as keyof typeof this.errors.form] =
            fieldError[0];
        } else {
          this.errors.form[field as keyof typeof this.errors.form] = "";
        }
      },

      get isFormValid() {
        return (
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.email
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, forgotPasswordFormSchema);
      },
    };
  });
}
