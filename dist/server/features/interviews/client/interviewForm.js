import Alpine from "alpinejs";
import { handleSubmit } from "../../../client/forms/formUtils.js";
import { interviewFormSchema } from "../schema.js";
function registerInterviewForm() {
  Alpine.data("interviewForm", () => {
    return {
      isSubmitting: false,
      hasPromoImage: false,
      form: {
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: ""
      },
      errors: {
        form: {
          q1: "",
          q2: "",
          q3: "",
          q4: "",
          q5: ""
        }
      },
      validateField(field) {
        const result = interviewFormSchema.safeParse(this.form);
        const fieldError = result.error?.flatten().fieldErrors[field];
        if (fieldError && fieldError[0]) {
          this.errors.form[field] = fieldError[0];
        } else {
          delete this.errors.form[field];
        }
      },
      get isFormValid() {
        return Object.values(this.errors.form).every((err) => !err) && this.form.q1 && this.form.q2 && this.form.q3 && this.form.q4 && this.form.q5 && this.hasPromoImage;
      },
      submitForm(event) {
        return handleSubmit(this, event, interviewFormSchema);
      }
    };
  });
}
export {
  registerInterviewForm
};
