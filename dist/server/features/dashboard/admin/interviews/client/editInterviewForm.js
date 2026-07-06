import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues
} from "../../../../../client/forms/formUtils.js";
import {
  interviewFormSchema
} from "../../../../../features/interviews/schema.js";
const INTERVIEW_FORM_FIELDS = Object.keys(interviewFormSchema.shape);
function registerEditInterviewForm() {
  Alpine.data(
    "editInterviewForm",
    (formValues = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(INTERVIEW_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, INTERVIEW_FORM_FIELDS, true);
        },
        validateField(field) {
          return validateField(this, field, interviewFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err) && ctx.form.q1 && ctx.form.q2 && ctx.form.q3 && ctx.form.q4 && ctx.form.q5;
        },
        submitForm(event) {
          return handleSubmit(this, event, interviewFormSchema);
        }
      };
    }
  );
}
export {
  registerEditInterviewForm
};
