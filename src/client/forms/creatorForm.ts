import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../../features/auth/schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "./formUtils";
import { creatorFormSchema } from "../../features/dashboard/creators/schema";

type CreatorFormShape = z.infer<typeof creatorFormSchema>;

const CREATOR_FORM_FIELDS = Object.keys(creatorFormSchema.shape);

export function registerCreatorForm() {
  Alpine.data(
    "creatorForm",
    (
      formValues: Partial<CreatorFormShape> = {},
      isEditMode: boolean = false,
    ) => {
      return {
        isSubmitting: false,

        ...createFormState(CREATOR_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, CREATOR_FORM_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, CREATOR_FORM_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, creatorFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof CreatorFormShape, string> };
            form: CreatorFormShape;
            isDirty: boolean;
          };
          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.displayName &&
            ctx.form.type
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, creatorFormSchema);
        },
      };
    },
  );
}
