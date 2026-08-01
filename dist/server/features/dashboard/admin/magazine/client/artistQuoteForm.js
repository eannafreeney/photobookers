import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues
} from "../../../../../client/forms/formUtils.js";
import {
  magazineArtistQuoteFormSchema
} from "../schema.js";
const ARTIST_QUOTE_FORM_FIELDS = Object.keys(
  magazineArtistQuoteFormSchema.shape
);
function registerMagazineArtistQuoteForm() {
  Alpine.data(
    "magazineArtistQuoteForm",
    (formValues = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(ARTIST_QUOTE_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, ARTIST_QUOTE_FORM_FIELDS, true);
        },
        validateField(field) {
          return validateField(this, field, magazineArtistQuoteFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err);
        },
        submitForm(event) {
          return handleSubmit(this, event, magazineArtistQuoteFormSchema);
        }
      };
    }
  );
}
export {
  registerMagazineArtistQuoteForm
};
