import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import {
  MagazineArtistQuoteFormSchema,
  magazineArtistQuoteFormSchema,
} from "../schema";

const ARTIST_QUOTE_FORM_FIELDS = Object.keys(
  magazineArtistQuoteFormSchema.shape,
);

export function registerMagazineArtistQuoteForm() {
  Alpine.data(
    "magazineArtistQuoteForm",
    (formValues: Partial<MagazineArtistQuoteFormSchema> = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(ARTIST_QUOTE_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, ARTIST_QUOTE_FORM_FIELDS, true);
        },

        validateField(field: string) {
          return validateField(this, field, magazineArtistQuoteFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
          };
          return Object.values(ctx.errors.form).every((err) => !err);
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, magazineArtistQuoteFormSchema);
        },
      };
    },
  );
}
