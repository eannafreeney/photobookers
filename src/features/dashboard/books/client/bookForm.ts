import Alpine from "alpinejs";
import { bookFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../client/forms/formUtils";
import { bookPressLinksAlpineMethods, parsePressLinks } from "./bookPressLinks";

type BookFormData = z.infer<typeof bookFormSchema>;

type BookFormThis = {
  is_new_artist: boolean;
  is_new_publisher: boolean;
  is_self_published: boolean;
  isArtist: boolean;
  isContributor: boolean;
  form: Partial<BookFormData> & Record<string, unknown>;
  errors: { form: Record<string, string> };
  isDirty: boolean;
};

const BOOK_FORM_FIELDS = Object.keys(bookFormSchema.shape);

export function registerBookForm() {
  Alpine.data(
    "bookForm",
    (
      formValues: Partial<BookFormData> & { press_links?: string } = {},
      artistOptions = [],
      publisherOptions = [],
      isArtist: boolean = false,
      isEditMode: boolean = false,
      isContributor: boolean = false,
    ) => {
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
          typeof formValues.press_links === "string"
            ? formValues.press_links
            : undefined,
        ),

        ...createFormState(BOOK_FORM_FIELDS, formValues),
        ...bookPressLinksAlpineMethods(),

        init() {
          initFormValues(this, BOOK_FORM_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, BOOK_FORM_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, bookFormSchema);
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
            ctx.form.release_date &&
            ctx.form.tags;
          const needsArtist = !ctx.isArtist;
          const needsPublisher = ctx.isArtist || ctx.isContributor;
          return (
            baseFieldsValid &&
            (!needsArtist || hasArtist) &&
            (!needsPublisher || hasPublisher)
          );
        },

        submitForm(event: Event) {
          // Hidden ComboBox inputs stay in the DOM under x-show; clear so
          // self-published submits as null publisher rather than a prior pick.
          const ctx = this as unknown as BookFormThis;
          if (ctx.is_self_published) {
            ctx.form.publisher_id = undefined;
            ctx.form.new_publisher_name = undefined;
            ctx.is_new_publisher = false;
          }
          return handleSubmit(this, event, bookFormSchema);
        },

        onSuccess() {
          resetFormBaseline(this, BOOK_FORM_FIELDS);
        },
      };
    },
  );
}
