import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import {
  MagazineArtistEmailFormSchema,
  magazineArtistEmailFormSchema,
} from "../schema";

const ARTIST_EMAIL_FORM_FIELDS = Object.keys(
  magazineArtistEmailFormSchema.shape,
);

export function registerMagazineArtistEmailForm() {
  Alpine.data(
    "magazineArtistEmailForm",
    (formValues: Partial<MagazineArtistEmailFormSchema> = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(ARTIST_EMAIL_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, ARTIST_EMAIL_FORM_FIELDS, true);
        },

        validateField(field: string) {
          return validateField(this, field, magazineArtistEmailFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
          };
          return Object.values(ctx.errors.form).every((err) => !err);
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, magazineArtistEmailFormSchema);
        },
      };
    },
  );
}
