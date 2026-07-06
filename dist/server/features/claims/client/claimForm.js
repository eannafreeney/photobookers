import Alpine from "alpinejs";
import { claimFormSchema } from "../schema.js";
import { handleSubmit } from "../../../client/forms/formUtils.js";
function registerClaimForm() {
  Alpine.data("claimForm", (props) => {
    return {
      isSubmitting: false,
      form: {
        verificationUrl: props.creatorWebsite ?? "",
        email: ""
      },
      initialValues: {
        form: {}
      },
      errors: {
        form: {}
      },
      get isFormValid() {
        const validationErrors = { ...this.errors.form };
        return Object.values(validationErrors).every((err) => !err) && this.form.verificationUrl && this.form.email;
      },
      submitForm(event) {
        return handleSubmit(this, event, claimFormSchema);
      }
    };
  });
}
export {
  registerClaimForm
};
