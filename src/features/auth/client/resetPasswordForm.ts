import Alpine from "alpinejs";
import { createRegisterFormUtils } from "./registerFormUtils";
import { handleSubmit, validateField } from "../../../client/forms/formUtils";
import { resetPasswordFormSchema } from "../schema";
import z from "zod";

type ResetPasswordFormShape = z.infer<typeof resetPasswordFormSchema>;

export function registerResetPasswordForm() {
  Alpine.data("resetPasswordForm", () => {
    return {
      isSubmitting: false,
      form: {
        password: "",
        confirmPassword: "",
      },

      errors: {
        form: {
          password: "",
          confirmPassword: "",
        },
        globalError: "",
      },

      validateField(field: string) {
        return validateField(this, field, resetPasswordFormSchema);
      },
      // Use common utilities
      ...createRegisterFormUtils(),

      get isFormValid() {
        const ctx = this as {
          errors: {
            form: Record<keyof ResetPasswordFormShape, string>;
            globalError: string;
          };
          form: ResetPasswordFormShape;
        };
        return (
          Object.values(ctx.errors.form).every((err) => !err) &&
          ctx.form.password &&
          ctx.form.confirmPassword &&
          ctx.form.confirmPassword === ctx.form.password
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, resetPasswordFormSchema);
      },
    };
  });
}
