import Alpine from "alpinejs";
import { editUserFormAdminSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";

type EditUserFormShape = z.infer<typeof editUserFormAdminSchema>;

const EDIT_USER_FORM_FIELDS = Object.keys(editUserFormAdminSchema.shape);

export function registerEditUserFormAdmin() {
  Alpine.data(
    "editUserFormAdmin",
    (
      formValues: Partial<EditUserFormShape> = {},
      isEditMode: boolean = false,
    ) => {
      return {
        isSubmitting: false,

        ...createFormState(EDIT_USER_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, EDIT_USER_FORM_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, EDIT_USER_FORM_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, editUserFormAdminSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof EditUserFormShape, string> };
            form: EditUserFormShape;
            isDirty: boolean;
          };
          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            !!ctx.form.email
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, editUserFormAdminSchema);
        },

        onSuccess() {
          (this as unknown as { isSubmitting: boolean }).isSubmitting = false;
          resetFormBaseline(this, EDIT_USER_FORM_FIELDS);
        },

        onError() {
          (this as unknown as { isSubmitting: boolean }).isSubmitting = false;
        },
      };
    },
  );
}
