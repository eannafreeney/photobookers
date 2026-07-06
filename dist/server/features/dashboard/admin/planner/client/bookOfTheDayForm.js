import Alpine from "alpinejs";
import { bookOfTheDayFormSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField
} from "../../../../../client/forms/formUtils.js";
const BOOK_OF_THE_DAY_FORM_FIELDS = Object.keys(bookOfTheDayFormSchema.shape);
function registerBookOfTheDayForm() {
  Alpine.data(
    "bookOfTheDayForm",
    (formValues, isEditMode = false) => {
      return {
        isSubmitting: false,
        ...createFormState(BOOK_OF_THE_DAY_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, BOOK_OF_THE_DAY_FORM_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, BOOK_OF_THE_DAY_FORM_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, bookOfTheDayFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.bookId;
        },
        submitForm(event) {
          return handleSubmit(this, event, bookOfTheDayFormSchema);
        }
      };
    }
  );
}
export {
  registerBookOfTheDayForm
};
