import Alpine from "alpinejs";
import {
  handleSubmit,
  getIsDirty,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import {
  InterviewFormSchema,
  interviewFormSchema,
} from "../../../../../features/interviews/schema";

const INTERVIEW_FORM_FIELDS = Object.keys(interviewFormSchema.shape);

export function registerEditInterviewForm() {
  Alpine.data(
    "editInterviewForm",
    (formValues: Partial<InterviewFormSchema> = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(INTERVIEW_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, INTERVIEW_FORM_FIELDS, true);
        },

        validateField(field: string) {
          return validateField(this, field, interviewFormSchema);
        },

        get isDirty() {
          return getIsDirty(this, INTERVIEW_FORM_FIELDS);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: {
              form: Record<keyof typeof interviewFormSchema.shape, string>;
            };
            form: typeof interviewFormSchema.shape;
            isDirty: boolean;
          };
          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.q1 &&
            ctx.form.q2 &&
            ctx.form.q3 &&
            ctx.form.q4 &&
            ctx.form.q5
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, interviewFormSchema);
        },
      };
    },
  );
}
