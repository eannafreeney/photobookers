import Alpine from "alpinejs";
import { creatorFormSchema } from "../../schemas";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "./formUtils";

type CreatorFormData = z.infer<typeof creatorFormSchema>;

const CREATOR_FORM_FIELDS = Object.keys(creatorFormSchema.shape);

export function registerCreatorForm() {
  Alpine.data(
    "creatorForm",
    (
      formValues: Partial<CreatorFormData> = {},
      isEditMode: boolean = false
    ) => {
      return {
        isSubmitting: false,
        isDisplayNameChecking: false,
        fieldStatus: "",
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
          return validateField(this, field, creatorFormSchema);
        },

        validateDisplayName() {
          this.validateField("displayName");
          if (this.form.displayName && this.form.displayName.length > 2) {
            this.checkDisplayNameAvailability();
            this.searchCreators();
          }
        },

        get isFormValid() {
          return (
            this.isDirty &&
            Object.values(this.errors.form).every((err) => !err) &&
            !this.displayNameIsTaken &&
            !this.isDisplayNameChecking &&
            this.form.displayName &&
            this.form.bio &&
            this.form.city &&
            this.form.country &&
            this.form.type
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, creatorFormSchema);
        },

        onSuccess() {
          resetFormBaseline(this, CREATOR_FORM_FIELDS);
          this.artistSearchResults = "";
        },

        onError() {
          this.isSubmitting = false;
        },

        async searchCreators() {
          if (!this.form.displayName || this.form.displayName.length < 2) {
            this.artistSearchResults = "";
            return;
          }

          try {
            const response = await fetch(
              `/api/search-artists?q=${encodeURIComponent(
                this.form.displayName
              )}`
            );
            const html = await response.text();
            this.artistSearchResults = html;
          } catch (error) {
            console.error("Failed to search artists", error);
          }
        },

        async checkDisplayNameAvailability() {
          if (!this.form.displayName) return;

          this.isDisplayNameChecking = true;
          try {
            const response = await fetch(
              `/api/check-displayName?displayName=${encodeURIComponent(
                this.form.displayName
              )}`
            );
            const html = await response.text();

            this.fieldStatus = html;
            this.displayNameIsTaken = html.includes("text-error");
          } catch (error) {
            console.error("Failed to check email availability", error);
          } finally {
            this.isDisplayNameChecking = false;
          }
        },
      };
    }
  );
}
