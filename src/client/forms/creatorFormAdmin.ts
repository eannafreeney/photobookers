import Alpine from "alpinejs";
import { creatorFormAdminSchema } from "../../features/dashboard/admin/creators/schemas";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";
import { createRegisterFormUtils } from "./registerFormUtils";
import z from "zod";

type CreatorFormAdminShape = z.infer<typeof creatorFormAdminSchema>;

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
        const ctx = this as unknown as {
          errors: { form: Record<keyof CreatorFormAdminShape, string> };
          form: CreatorFormAdminShape;
          isDirty: boolean;
          displayNameIsTaken: boolean;
          isDisplayNameChecking: boolean;
        };
        return !!(
          ctx.isDirty &&
          Object.values(ctx.errors.form).every((err) => !err) &&
          !ctx.displayNameIsTaken &&
          !ctx.isDisplayNameChecking &&
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
