import Alpine from "alpinejs";
import { bookOfTheDayFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../client/forms/formUtils";

export type BookOfTheDayFormData = z.infer<typeof bookOfTheDayFormSchema>;

const BOOK_OF_THE_DAY_FORM_FIELDS = Object.keys(bookOfTheDayFormSchema.shape);

export function registerBookOfTheDayForm() {
  Alpine.data(
    "bookOfTheDayForm",
    (formValues: BookOfTheDayFormData, isEditMode: boolean = false) => {
      return {
        isSubmitting: false,

        ...createFormState(BOOK_OF_THE_DAY_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, BOOK_OF_THE_DAY_FORM_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, BOOK_OF_THE_DAY_FORM_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, bookOfTheDayFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof BookOfTheDayFormData, string> };
            form: BookOfTheDayFormData;
            isDirty: boolean;
          };

          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.bookId
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, bookOfTheDayFormSchema);
        },
      };
    },
  );
}
