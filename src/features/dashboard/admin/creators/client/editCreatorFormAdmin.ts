import Alpine from "alpinejs";
import { creatorFormAdminSchema } from "../schemas";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";

type CreatorFormAdminShape = z.infer<typeof creatorFormAdminSchema>;

const CREATOR_FORM_FIELDS = Object.keys(creatorFormAdminSchema.shape);

export function registerEditCreatorFormAdmin() {
  Alpine.data(
    "editCreatorFormAdmin",
    (
      formValues: Partial<CreatorFormAdminShape> = {},
      isEditMode: boolean = false,
    ) => {
      return {
        isSubmitting: false,
        displayNameIsTaken: false,

        ...createFormState(CREATOR_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, CREATOR_FORM_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, CREATOR_FORM_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, creatorFormAdminSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof CreatorFormAdminShape, string> };
            form: CreatorFormAdminShape;
            isDirty: boolean;
            displayNameIsTaken: boolean;
          };
          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            !ctx.displayNameIsTaken
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, creatorFormAdminSchema);
        },

        onSuccess() {
          resetFormBaseline(this, CREATOR_FORM_FIELDS);
        },

        onError() {
          (this as unknown as { isSubmitting: boolean }).isSubmitting = false;
        },
      };
    },
  );
}
