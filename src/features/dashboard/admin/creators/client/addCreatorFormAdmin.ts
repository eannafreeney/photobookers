import Alpine from "alpinejs";
import { creatorFormAdminSchema } from "../schemas";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../../client/forms/formUtils";
import { createRegisterFormUtils } from "../../../../auth/client/registerFormUtils";
import z from "zod";

type CreatorFormAdminShape = z.infer<typeof creatorFormAdminSchema>;

const CREATOR_FORM_ADMIN_FIELDS = Object.keys(creatorFormAdminSchema.shape);

export function registerAddCreatorFormAdmin() {
  Alpine.data("addCreatorFormAdmin", () => {
    return {
      isSubmitting: false,
      displayNameIsTaken: false,

      ...createFormState(CREATOR_FORM_ADMIN_FIELDS),
      ...createRegisterFormUtils(),

      init() {
        initFormValues(this, CREATOR_FORM_ADMIN_FIELDS, false);
      },

      get isDirty() {
        return getIsDirty(this, CREATOR_FORM_ADMIN_FIELDS);
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
        return !!(
          ctx.isDirty &&
          Object.values(ctx.errors.form).every((err) => !err) &&
          !ctx.displayNameIsTaken &&
          ctx.form.displayName &&
          ctx.form.type &&
          ctx.form.website
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, creatorFormAdminSchema);
      },

      onSuccess() {
        resetFormBaseline(this, CREATOR_FORM_ADMIN_FIELDS);
      },

      onError() {
        (this as unknown as { isSubmitting: boolean }).isSubmitting = false;
      },
    };
  });
}
