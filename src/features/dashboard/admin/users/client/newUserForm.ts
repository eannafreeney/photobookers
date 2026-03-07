import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../client/forms/formUtils";
import { createRegisterFormUtils } from "../../../../auth/client/registerFormUtils";
import { newUserFormAdminSchema } from "../schema";
import z from "zod";
import { creatorFormAdminSchema } from "../../creators/schemas";

type NewUserFormShape = z.infer<typeof newUserFormAdminSchema>;

const NEW_USER_FORM_FIELDS = Object.keys(newUserFormAdminSchema.shape);

export function registerNewUserForm() {
  Alpine.data("newUserForm", () => {
    return {
      isSubmitting: false,
      emailIsTaken: false,

      ...createFormState(NEW_USER_FORM_FIELDS),
      ...createRegisterFormUtils(),

      init() {
        initFormValues(this, NEW_USER_FORM_FIELDS, false);
      },

      get isDirty() {
        return getIsDirty(this, NEW_USER_FORM_FIELDS);
      },

      validateField(field: string) {
        return validateField(this, field, newUserFormAdminSchema);
      },

      get isFormValid() {
        const ctx = this as unknown as {
          errors: { form: Record<keyof NewUserFormShape, string> };
          form: NewUserFormShape;
          emailIsTaken: boolean;
          isDirty: boolean;
        };
        return !!(
          ctx.isDirty &&
          Object.values(ctx.errors.form).every((err) => !err) &&
          !ctx.emailIsTaken &&
          ctx.form.email
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, creatorFormAdminSchema);
      },
    };
  });
}
