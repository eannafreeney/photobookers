import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import {
  MagazineDetailsFormSchema,
  magazineDetailsFormSchema,
} from "../schema";

const DETAILS_FORM_FIELDS = Object.keys(magazineDetailsFormSchema.shape);

export function registerMagazineDetailsForm() {
  Alpine.data(
    "magazineDetailsForm",
    (formValues: Partial<MagazineDetailsFormSchema> = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(DETAILS_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, DETAILS_FORM_FIELDS, true);
        },

        validateField(field: string) {
          return validateField(this, field, magazineDetailsFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
            form: Record<string, string>;
          };
          return (
            Object.values(ctx.errors.form).every((err) => !err) &&
            Boolean(ctx.form.title?.trim())
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, magazineDetailsFormSchema);
        },
      };
    },
  );
}
