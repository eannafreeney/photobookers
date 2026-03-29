import Alpine from "alpinejs";
import { artistOfTheWeekFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../client/forms/formUtils";

export type AOTWFormData = z.infer<typeof artistOfTheWeekFormSchema>;

const AOTW_FIELDS = Object.keys(artistOfTheWeekFormSchema.shape);

export function registerAOTWForm() {
  Alpine.data(
    "aotwForm",
    (formValues: AOTWFormData, isEditMode: boolean = false) => {
      return {
        isSubmitting: false,

        ...createFormState(AOTW_FIELDS, formValues),

        init() {
          initFormValues(this, AOTW_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, AOTW_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, artistOfTheWeekFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof AOTWFormData, string> };
            form: AOTWFormData;
          };

          return (
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.creatorId
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, artistOfTheWeekFormSchema);
        },
      };
    },
  );
}
