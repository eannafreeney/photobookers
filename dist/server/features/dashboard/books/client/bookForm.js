import Alpine from "alpinejs";
import { bookFormSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../client/forms/formUtils.js";
const BOOK_FORM_FIELDS = Object.keys(bookFormSchema.shape);
function registerBookForm() {
  Alpine.data(
    "bookForm",
    (formValues = {}, artistOptions = [], publisherOptions = [], isArtist = false, isEditMode = false) => {
      return {
        artistOptions,
        publisherOptions,
        isSubmitting: false,
        is_new_artist: false,
        is_new_publisher: false,
        is_self_published: isArtist,
        isArtist,
        ...createFormState(BOOK_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, BOOK_FORM_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, BOOK_FORM_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, bookFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          const hasArtist = ctx.is_new_artist ? !!ctx.form.new_artist_name : !!ctx.form.artist_id;
          const hasPublisher = ctx.is_self_published ? true : ctx.is_new_publisher ? !!ctx.form.new_publisher_name : !!ctx.form.publisher_id;
          const baseFieldsValid = ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.title && ctx.form.availability_status && ctx.form.release_date;
          const conditionalFieldsValid = ctx.isArtist ? hasPublisher : hasArtist;
          return baseFieldsValid && conditionalFieldsValid;
        },
        submitForm(event) {
          return handleSubmit(this, event, bookFormSchema);
        },
        onSuccess() {
          resetFormBaseline(this, BOOK_FORM_FIELDS);
        }
      };
    }
  );
}
export {
  registerBookForm
};
