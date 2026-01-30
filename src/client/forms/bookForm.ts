import Alpine from "alpinejs";
import { bookFormSchema } from "../../schemas";
import z from "zod";

type BookFormData = z.infer<typeof bookFormSchema>;

const BOOK_FORM_FIELDS = Object.keys(bookFormSchema.shape);

export function registerBookForm() {
  Alpine.data(
    "bookForm",
    (
      formValues: Partial<BookFormData> = {},
      artistOptions = [],
      publisherOptions = [],
      isArtist: boolean = false,
      isEditMode: boolean = false
    ) => {
      return {
        artistOptions,
        publisherOptions,
        isSubmitting: false,
        is_new_artist: false,
        is_new_publisher: false,
        is_self_published: isArtist,
        isArtist,

        // Initialize fields dynamically
        form: {
          ...Object.fromEntries(
            BOOK_FORM_FIELDS.map((key) => [key, formValues[key] ?? ""])
          ),
        },

        initialValues: {
          form: {},
        },

        errors: {
          form: {},
        },

        init() {
          if (isEditMode) {
            // Capture initial state dynamically for edit mode
            this.initialValues.form = Object.fromEntries(
              BOOK_FORM_FIELDS.map((key) => [key, this.form[key]])
            );
          } else {
            // Initialize with empty strings for create mode so isDirty works correctly
            this.initialValues.form = Object.fromEntries(
              BOOK_FORM_FIELDS.map((key) => [key, ""])
            );
          }
        },

        get isDirty() {
          return BOOK_FORM_FIELDS.some(
            (key) => this.form[key] !== this.initialValues.form[key]
          );
        },

        validateField(field: string) {
          const result = bookFormSchema.safeParse(this.form);
          const fieldError =
            result.error?.flatten().fieldErrors[
              field as keyof typeof this.errors.form
            ];
          if (fieldError && fieldError[0]) {
            this.errors.form[field as keyof typeof this.errors.form] =
              fieldError[0];
          } else {
            delete this.errors.form[field as keyof typeof this.errors.form];
          }
        },

        get isFormValid() {
          console.log(this);

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
            this.form.specs &&
            this.form.description &&
            this.form.availability_status &&
            this.form.release_date;

          // Artists need publisher (unless self-published), publishers need artist
          const conditionalFieldsValid = this.isArtist
            ? hasPublisher
            : hasArtist;

          return baseFieldsValid && conditionalFieldsValid;
        },

        submitForm(event: Event) {
          this.isSubmitting = true;
          const result = bookFormSchema.safeParse(this.form);

          if (!result.success) {
            event.preventDefault();
            this.errors.form = result.error.flatten().fieldErrors;
            return;
          }
        },
      };
    }
  );
}
