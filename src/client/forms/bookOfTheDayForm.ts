import Alpine from "alpinejs";
import { bookFormSchema, bookOfTheDayFormSchema } from "../../schemas";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";

type BookOfTheDayFormData = z.infer<typeof bookOfTheDayFormSchema>;

const BOOK_OF_THE_DAY_FORM_FIELDS = Object.keys(bookOfTheDayFormSchema.shape);

export function registerBookForm() {
  Alpine.data("bookOfTheDayForm", () => {
    return {
      isSubmitting: false,

      ...createFormState(BOOK_OF_THE_DAY_FORM_FIELDS),

      init() {
        initFormValues(this, BOOK_OF_THE_DAY_FORM_FIELDS);
      },

      get isDirty() {
        return getIsDirty(this, BOOK_OF_THE_DAY_FORM_FIELDS);
      },

      validateField(field: string) {
        return validateField(this, field, bookOfTheDayFormSchema);
      },

      get isFormValid() {
        return (
          this.isDirty &&
          Object.values(this.errors.form).every((err) => !err) &&
          this.form.date &&
          this.form.text
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, bookOfTheDayFormSchema);
      },
    };
  });
}
