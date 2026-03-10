import Alpine from "alpinejs";
import { bookOfTheWeekFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../client/forms/formUtils";

export type BookOfTheWeekFormData = z.infer<typeof bookOfTheWeekFormSchema>;

const BOOK_OF_THE_WEEK_FORM_FIELDS = Object.keys(bookOfTheWeekFormSchema.shape);

export function registerBookOfTheWeekForm() {
  Alpine.data(
    "bookOfTheWeekForm",
    (formValues: BookOfTheWeekFormData, isEditMode: boolean = false) => {
      return {
        isSubmitting: false,

        ...createFormState(BOOK_OF_THE_WEEK_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, BOOK_OF_THE_WEEK_FORM_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, BOOK_OF_THE_WEEK_FORM_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, bookOfTheWeekFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof BookOfTheWeekFormData, string> };
            form: BookOfTheWeekFormData;
            isDirty: boolean;
          };

          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.text &&
            ctx.form.bookId
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, bookOfTheWeekFormSchema);
        },
      };
    },
  );
}
