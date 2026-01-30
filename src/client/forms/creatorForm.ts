import Alpine from "alpinejs";
import { creatorFormSchema } from "../../schemas";
import z from "zod";

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

        // Initialize fields dynamically
        form: {
          ...Object.fromEntries(
            CREATOR_FORM_FIELDS.map((key) => [key, formValues[key] ?? ""])
          ),
        },

        initialValues: {
          form: {},
        },

        errors: {
          form: {},
        },

        init() {
          if (isEditMode) {
            // Capture initial state dynamically for edit mode
            this.initialValues.form = Object.fromEntries(
              CREATOR_FORM_FIELDS.map((key) => [key, this.form[key]])
            );
          } else {
            // Initialize with empty strings for create mode so isDirty works correctly
            this.initialValues.form = Object.fromEntries(
              CREATOR_FORM_FIELDS.map((key) => [key, ""])
            );
          }
        },

        get isDirty() {
          return CREATOR_FORM_FIELDS.some(
            (key) => this.form[key] !== this.initialValues.form[key]
          );
        },

        validateField(field: string) {
          const result = creatorFormSchema.safeParse(this.form);
          const fieldError =
            result.error?.flatten().fieldErrors[
              field as keyof typeof this.errors.form
            ];
          if (fieldError && fieldError[0]) {
            this.errors.form[field as keyof typeof this.errors.form] =
              fieldError[0];
          } else {
            delete this.errors.form[field as keyof typeof this.errors.form];
          }
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
          const result = creatorFormSchema.safeParse(this.form);

          if (!result.success || !this.isFormValid) {
            event.preventDefault();
            this.errors.form = result.error.flatten().fieldErrors;
          }

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
