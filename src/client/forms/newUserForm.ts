import Alpine from "alpinejs";
import { creatorFormAdminSchema, newUserFormSchema } from "../../schemas";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";
import { createRegisterFormUtils } from "./registerFormUtils";

const NEW_USER_FORM_FIELDS = Object.keys(newUserFormSchema.shape);

export function registerNewUserForm() {
  Alpine.data("newUserForm", () => {
    return {
      isSubmitting: false,
      emailAvailabilityStatus: "",
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
        return validateField(this, field, newUserFormSchema);
      },

      get isFormValid() {
        return !!(
          this.isDirty &&
          Object.values(this.errors.form).every((err) => !err) &&
          !this.emailIsTaken &&
          this.form.email &&
          this.form.firstName &&
          this.form.lastName &&
          this.form.password
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, creatorFormAdminSchema);
      },

      onSuccess() {
        resetFormBaseline(this, NEW_USER_FORM_FIELDS);
      },

      onError() {
        this.isSubmitting = false;
      },

      async checkEmailAvailability() {
        if (!this.form.email) return;

        this.isEmailChecking = true;
        try {
          const response = await fetch(
            `/api/check-email?email=${encodeURIComponent(this.form.email)}`,
          );
          const html = await response.text();

          this.emailAvailabilityStatus = html;
          this.emailIsTaken = html.includes("text-error");
        } catch (error) {
          console.error("Failed to check email availability", error);
        } finally {
          this.isEmailChecking = false;
        }
      },
    };
  });
}
