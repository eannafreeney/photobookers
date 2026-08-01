import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues
} from "../../../../../client/forms/formUtils.js";
import {
  magazineArtistEmailFormSchema
} from "../schema.js";
const ARTIST_EMAIL_FORM_FIELDS = Object.keys(
  magazineArtistEmailFormSchema.shape
);
function registerMagazineArtistEmailForm() {
  Alpine.data(
    "magazineArtistEmailForm",
    (formValues = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(ARTIST_EMAIL_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, ARTIST_EMAIL_FORM_FIELDS, true);
        },
        validateField(field) {
          return validateField(this, field, magazineArtistEmailFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err);
        },
        submitForm(event) {
          return handleSubmit(this, event, magazineArtistEmailFormSchema);
        }
      };
    }
  );
}
export {
  registerMagazineArtistEmailForm
};
