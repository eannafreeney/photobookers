import Alpine from "alpinejs";
import z from "zod";
import { handleSubmit } from "./formUtils";
import { contactFormSchema } from "../../features/app/schema";

type ContactFormShape = z.infer<typeof contactFormSchema>;

export function registerContactForm() {
  Alpine.data("contactForm", () => {
    return {
      isSubmitting: false,
      form: {
        name: "",
        email: "",
        message: "",
      },
      errors: {
        form: {
          name: "",
          email: "",
          message: "",
        },
      },

      validateField(field: string) {
        const result = contactFormSchema.safeParse(this.form);
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
          this.form.name &&
          this.form.message
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, contactFormSchema);
      },
    };
  });
}
