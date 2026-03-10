import Alpine from "alpinejs";
import { publisherOfTheWeekFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../client/forms/formUtils";

export type POTWFormData = z.infer<typeof publisherOfTheWeekFormSchema>;

const POTW_FIELDS = Object.keys(publisherOfTheWeekFormSchema.shape);

export function registerPOTWForm() {
  Alpine.data(
    "potwForm",
    (formValues: POTWFormData, isEditMode: boolean = false) => {
      return {
        isSubmitting: false,

        ...createFormState(POTW_FIELDS, formValues),

        init() {
          initFormValues(this, POTW_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, POTW_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, publisherOfTheWeekFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof POTWFormData, string> };
            form: POTWFormData;
          };

          return (
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.creatorId &&
            ctx.form.text
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, publisherOfTheWeekFormSchema);
        },
      };
    },
  );
}
