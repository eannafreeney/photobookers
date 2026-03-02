import Alpine from "alpinejs";
import { creatorFormAdminSchema } from "../../features/dashboard/admin/creators/schemas";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";

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
        isDisplayNameChecking: false,
        displayNameAvailabilityStatus: "",
        displayNameIsTaken: false,
        artistSearchResults: "",

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
            isDisplayNameChecking: boolean;
          };
          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            !ctx.displayNameIsTaken &&
            !ctx.isDisplayNameChecking
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, creatorFormAdminSchema);
        },

        onSuccess() {
          resetFormBaseline(this, CREATOR_FORM_FIELDS);
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
    },
  );
}
