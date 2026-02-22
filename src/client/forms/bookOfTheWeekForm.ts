import Alpine from "alpinejs";
import { bookOfTheWeekFormSchema } from "../../schemas";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "./formUtils";

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
          return (
            this.isDirty &&
            Object.values(this.errors.form).every((err) => !err) &&
            this.form.weekStart &&
            this.form.text
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, bookOfTheWeekFormSchema);
        },
      };
    },
  );
}
