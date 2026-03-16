import Alpine from "alpinejs";
import { bookFormAdminSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";

type BookFormAdminShape = z.infer<typeof bookFormAdminSchema>;

type BookFormThis = {
  is_new_artist: boolean;
  is_new_publisher: boolean;
  is_self_published: boolean;
  isArtist: boolean;
  form: Partial<BookFormAdminShape> & Record<string, unknown>;
  errors: { form: Record<string, string> };
  isDirty: boolean;
};

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
          const ctx = this as unknown as BookFormThis;
          const hasArtist = ctx.is_new_artist
            ? !!ctx.form.new_artist_name
            : !!ctx.form.artist_id;
          const hasPublisher = ctx.is_self_published
            ? true
            : ctx.is_new_publisher
              ? !!ctx.form.new_publisher_name
              : !!ctx.form.publisher_id;
          const baseFieldsValid =
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.title &&
            ctx.form.availability_status &&
            ctx.form.release_date;
          const conditionalFieldsValid = ctx.isArtist
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
