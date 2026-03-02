import Alpine from "alpinejs";
import { registerCreatorFormSchema } from "../../features/auth/schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";

type CreatorFormShape = z.infer<typeof registerCreatorFormSchema>;

const CREATOR_FORM_FIELDS = Object.keys(registerCreatorFormSchema.shape);

export function registerCreatorForm() {
  Alpine.data(
    "creatorForm",
    (
      formValues: Partial<CreatorFormShape> = {},
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
          return validateField(this, field, registerCreatorFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof CreatorFormShape, string> };
            form: CreatorFormShape;
            isDirty: boolean;
            displayNameIsTaken: boolean;
            isDisplayNameChecking: boolean;
          };
          return (
            ctx.isDirty &&
            Object.values(ctx.errors.form).every((err) => !err) &&
            !ctx.displayNameIsTaken &&
            !ctx.isDisplayNameChecking &&
            ctx.form.displayName &&
            ctx.form.type
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, registerCreatorFormSchema);
        },

        onSuccess() {
          resetFormBaseline(this, CREATOR_FORM_FIELDS);
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
    },
  );
}
