import Alpine from "alpinejs";
import { creatorFormAdminSchema } from "../../schemas";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";
import { createRegisterFormUtils } from "./registerFormUtils";

const CREATOR_FORM_ADMIN_FIELDS = Object.keys(creatorFormAdminSchema.shape);

export function registerCreatorFormAdmin() {
  Alpine.data("creatorFormAdmin", () => {
    return {
      isSubmitting: false,
      isDisplayNameChecking: false,
      displayNameAvailabilityStatus: "",
      displayNameIsTaken: false,
      artistSearchResults: "",

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
        return !!(
          this.isDirty &&
          Object.values(this.errors.form).every((err) => !err) &&
          !this.displayNameIsTaken &&
          !this.isDisplayNameChecking &&
          this.form.displayName &&
          this.form.type &&
          this.form.website
        );
      },

      submitForm(event: Event) {
        return handleSubmit(this, event, creatorFormAdminSchema);
      },

      onSuccess() {
        resetFormBaseline(this, CREATOR_FORM_ADMIN_FIELDS);
        this.artistSearchResults = "";
      },

      onError() {
        this.isSubmitting = false;
      },

      async checkDisplayNameAvailability() {
        if (!this.form.displayName) return;

        this.isDisplayNameChecking = true;
        try {
          const response = await fetch(
            `/api/check-displayName?displayName=${encodeURIComponent(
              this.form.displayName,
            )}`,
          );
          const html = await response.text();

          this.displayNameAvailabilityStatus = html;
          this.displayNameIsTaken = html.includes("text-error");
        } catch (error) {
          console.error("Failed to check email availability", error);
        } finally {
          this.isDisplayNameChecking = false;
        }
      },
    };
  });
}
