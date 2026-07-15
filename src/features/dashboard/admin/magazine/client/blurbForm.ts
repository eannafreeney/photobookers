import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import { MagazineBlurbFormSchema, magazineBlurbFormSchema } from "../schema";

const BLURB_FORM_FIELDS = Object.keys(magazineBlurbFormSchema.shape);

export function registerMagazineBlurbForm() {
  Alpine.data(
    "magazineBlurbForm",
    (formValues: Partial<MagazineBlurbFormSchema> = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(BLURB_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, BLURB_FORM_FIELDS, true);
        },

        validateField(field: string) {
          return validateField(this, field, magazineBlurbFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
          };
          return Object.values(ctx.errors.form).every((err) => !err);
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, magazineBlurbFormSchema);
        },
      };
    },
  );
}
