import Alpine from "alpinejs";
import { bookFormAdminSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../../client/forms/formUtils.js";
const BOOK_FORM_FIELDS = Object.keys(bookFormAdminSchema.shape);
function registerBookFormAdmin() {
  Alpine.data(
    "bookFormAdmin",
    (formValues = {}, artistOptions = [], publisherOptions = [], isEditMode = false) => {
      return {
        artistOptions,
        publisherOptions,
        isSubmitting: false,
        is_new_artist: false,
        is_new_publisher: false,
        ...createFormState(BOOK_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, BOOK_FORM_FIELDS, isEditMode);
        },
        get isDirty() {
          return getIsDirty(this, BOOK_FORM_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, bookFormAdminSchema);
        },
        get isFormValid() {
          const ctx = this;
          const hasArtist = ctx.is_new_artist ? !!ctx.form.new_artist_name : !!ctx.form.artist_id;
          const hasPublisher = ctx.is_self_published ? true : ctx.is_new_publisher ? !!ctx.form.new_publisher_name : !!ctx.form.publisher_id;
          const baseFieldsValid = ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.title && ctx.form.availability_status;
          const conditionalFieldsValid = ctx.isArtist ? hasPublisher : hasArtist;
          return baseFieldsValid && conditionalFieldsValid;
        },
        submitForm(event) {
          return handleSubmit(this, event, bookFormAdminSchema);
        },
        onSuccess() {
          resetFormBaseline(this, BOOK_FORM_FIELDS);
        }
      };
    }
  );
}
export {
  registerBookFormAdmin
};
