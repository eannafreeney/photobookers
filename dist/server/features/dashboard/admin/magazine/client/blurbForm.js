import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues
} from "../../../../../client/forms/formUtils.js";
import { magazineBlurbFormSchema } from "../schema.js";
const BLURB_FORM_FIELDS = Object.keys(magazineBlurbFormSchema.shape);
function registerMagazineBlurbForm() {
  Alpine.data(
    "magazineBlurbForm",
    (formValues = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(BLURB_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, BLURB_FORM_FIELDS, true);
        },
        validateField(field) {
          return validateField(this, field, magazineBlurbFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err);
        },
        submitForm(event) {
          return handleSubmit(this, event, magazineBlurbFormSchema);
        }
      };
    }
  );
}
export {
  registerMagazineBlurbForm
};
