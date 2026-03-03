import Alpine from "alpinejs";
import { bookFormAdminSchema } from "../../features/dashboard/admin/books/schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";

type BookFormAdminShape = z.infer<typeof bookFormAdminSchema>;

const BOOK_FORM_FIELDS = Object.keys(bookFormAdminSchema.shape);

export function registerBookFormAdmin() {
  Alpine.data(
    "bookFormAdmin",
    (
      formValues: Partial<BookFormAdminShape> = {},
      artistOptions = [],
      publisherOptions = [],
      isEditMode: boolean = false,
    ) => {
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

        validateField(field: string) {
          return validateField(this, field, bookFormAdminSchema);
        },

        get isFormValid() {
          // Check artist requirement (for publishers)
          const hasArtist = this.is_new_artist
            ? !!this.form.new_artist_name
            : !!this.form.artist_id;

          // Check publisher requirement (for artists, unless self-published)
          const hasPublisher = this.is_self_published
            ? true
            : this.is_new_publisher
              ? !!this.form.new_publisher_name
              : !!this.form.publisher_id;

          const baseFieldsValid =
            this.isDirty &&
            Object.values(this.errors.form).every((err) => !err) &&
            this.form.title &&
            this.form.availability_status;

          // Artists need publisher (unless self-published), publishers need artist
          const conditionalFieldsValid = this.isArtist
            ? hasPublisher
            : hasArtist;

          return baseFieldsValid && conditionalFieldsValid;
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, bookFormAdminSchema);
        },

        onSuccess() {
          resetFormBaseline(this, BOOK_FORM_FIELDS);
        },
      };
    },
  );
}
