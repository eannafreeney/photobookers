import Alpine from "alpinejs";
import { claimFormSchema } from "../schema";
import { handleSubmit } from "../../../client/forms/formUtils";

export function registerClaimForm() {
  Alpine.data("claimForm", (props: { creatorWebsite?: string }) => {
    return {
      isSubmitting: false,
      form: {
        verificationUrl: props.creatorWebsite ?? "",
        email: "",
      },

      initialValues: {
        form: {},
      },

      errors: {
        form: {},
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
        return handleSubmit(this, event, claimFormSchema);
      },
    };
  });
}
