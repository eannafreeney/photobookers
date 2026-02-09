import Alpine from "alpinejs";
import { bookFormSchema, claimFormSchema } from "../../schemas";

const CLAIM_FORM_FIELDS = Object.keys(claimFormSchema.shape);

export function registerClaimForm() {
  Alpine.data("claimForm", (props: { creatorWebsite?: string }) => {
    return {
      isSubmitting: false,
      form: {
        verificationUrl: props.creatorWebsite ?? "",
      },

      initialValues: {
        form: {},
      },

      errors: {
        form: {},
      },

      // init() {
      //   // Initialize with empty strings for create mode so isDirty works correctly
      //   this.initialValues.form = Object.fromEntries(
      //     CLAIM_FORM_FIELDS.map((key) => [key, ""])
      //   );
      // },

      validateField(field: string) {
        const result = bookFormSchema.safeParse(this.form);
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

      get isFormValid() {
        const validationErrors = { ...this.errors.form };

        return (
          Object.values(validationErrors).every((err) => !err) &&
          this.form.verificationUrl &&
          this.form.email
        );
      },

      submitForm(event: Event) {
        this.isSubmitting = true;
        const result = bookFormSchema.safeParse(this.form);

        if (!result.success) {
          event.preventDefault();
          this.isSubmitting = false;

          this.errors.form = result.error.flatten().fieldErrors;
          return;
        }
      },
    };
  });
}
