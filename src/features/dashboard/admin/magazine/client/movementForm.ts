import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import {
  MagazineMovementFormSchema,
  magazineMovementFormSchema,
} from "../schema";

const MOVEMENT_FORM_FIELDS = Object.keys(magazineMovementFormSchema.shape);

export function registerMagazineMovementForm() {
  Alpine.data(
    "magazineMovementForm",
    (formValues: Partial<MagazineMovementFormSchema> = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(MOVEMENT_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, MOVEMENT_FORM_FIELDS, true);
        },

        validateField(field: string) {
          return validateField(this, field, magazineMovementFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
            form: Record<string, string>;
          };
          return (
            Object.values(ctx.errors.form).every((err) => !err) &&
            Boolean(ctx.form.kicker?.trim()) &&
            Boolean(ctx.form.lead?.trim()) &&
            Boolean(ctx.form.title?.trim())
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, magazineMovementFormSchema);
        },
      };
    },
  );
}
