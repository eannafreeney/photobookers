import Alpine from "alpinejs";
import { handleSubmit } from "../../../client/forms/formUtils.js";
import { contactFormSchema } from "../schema.js";
function registerContactForm() {
  Alpine.data("contactForm", () => {
    return {
      isSubmitting: false,
      form: {
        name: "",
        email: "",
        message: ""
      },
      errors: {
        form: {
          name: "",
          email: "",
          message: ""
        }
      },
      validateField(field) {
        const result = contactFormSchema.safeParse(this.form);
        const fieldError = result.error?.flatten().fieldErrors[field];
        if (fieldError && fieldError[0]) {
          this.errors.form[field] = fieldError[0];
        } else {
          delete this.errors.form[field];
        }
      },
      get isFormValid() {
        return Object.values(this.errors.form).every((err) => !err) && this.form.email && this.form.name && this.form.message;
      },
      submitForm(event) {
        return handleSubmit(this, event, contactFormSchema);
      }
    };
  });
}
export {
  registerContactForm
};
