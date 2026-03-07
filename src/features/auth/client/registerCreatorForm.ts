import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../schema";
import { createRegisterFormUtils } from "../client/registerFormUtils";
import { handleSubmit } from "../../../client/forms/formUtils";
import z from "zod";

type RegisterCreatorFormShape = z.infer<typeof registerCreatorFormSchema>;

export function registerRegisterCreatorForm() {
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
        },
      },
      // Use common utilities
      ...createRegisterFormUtils(),

      get isFormValid() {
        const ctx = this as unknown as {
          errors: { form: Record<keyof RegisterCreatorFormShape, string> };
          form: RegisterCreatorFormShape;
          emailIsTaken: boolean;
          displayNameIsTaken: boolean;
          websiteIsTaken: boolean;
        };
        return (
          Object.values(ctx.errors.form).every((err) => !err) &&
          ctx.form.displayName &&
          ctx.form.website &&
          ctx.form.type &&
          ctx.form.email &&
          ctx.form.password &&
          ctx.form.confirmPassword &&
          ctx.form.confirmPassword === ctx.form.password &&
          ctx.form.agreeToTerms &&
          !ctx.emailIsTaken &&
          !ctx.displayNameIsTaken &&
          !ctx.websiteIsTaken
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, registerCreatorFormSchema);
      },
    };
  });
}
