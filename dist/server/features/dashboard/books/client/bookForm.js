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
import { bookPressLinksAlpineMethods, parsePressLinks } from "./bookPressLinks.js";
const BOOK_FORM_FIELDS = Object.keys(bookFormSchema.shape);
function registerBookForm() {
  Alpine.data(
    "bookForm",
    (formValues = {}, artistOptions = [], publisherOptions = [], isArtist = false, isEditMode = false, isContributor = false) => {
      return {
        artistOptions,
        publisherOptions,
        isSubmitting: false,
        is_new_artist: false,
        is_new_publisher: false,
        // Artists default self-published; contributors opt in via toggle
        is_self_published: isArtist,
        isArtist,
        isContributor,
        pressLinks: parsePressLinks(
          typeof formValues.press_links === "string" ? formValues.press_links : void 0
        ),
        ...createFormState(BOOK_FORM_FIELDS, formValues),
        ...bookPressLinksAlpineMethods(),
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
          const baseFieldsValid = ctx.isDirty && Object.values(ctx.errors.form).every((err) => !err) && ctx.form.title && ctx.form.availability_status && ctx.form.release_date && ctx.form.tags;
          const needsArtist = !ctx.isArtist;
          const needsPublisher = ctx.isArtist || ctx.isContributor;
          return baseFieldsValid && (!needsArtist || hasArtist) && (!needsPublisher || hasPublisher);
        },
        submitForm(event) {
          const ctx = this;
          if (ctx.is_self_published) {
            ctx.form.publisher_id = void 0;
            ctx.form.new_publisher_name = void 0;
            ctx.is_new_publisher = false;
          }
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
