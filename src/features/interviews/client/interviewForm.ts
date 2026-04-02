import Alpine from "alpinejs";
import { handleSubmit } from "../../../client/forms/formUtils";
import { interviewFormSchema } from "../schema";

export function registerInterviewForm() {
  Alpine.data("interviewForm", () => {
    return {
      isSubmitting: false,
      form: {
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
      },
      errors: {
        form: {
          q1: "",
          q2: "",
          q3: "",
          q4: "",
          q5: "",
        },
      },

      validateField(field: string) {
        const result = interviewFormSchema.safeParse(this.form);
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
          this.form.q1 &&
          this.form.q2 &&
          this.form.q3 &&
          this.form.q4 &&
          this.form.q5
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, interviewFormSchema);
      },
    };
  });
}
