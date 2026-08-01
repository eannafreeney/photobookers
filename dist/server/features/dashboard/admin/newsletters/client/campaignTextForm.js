import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField
} from "../../../../../client/forms/formUtils.js";
import {
  newsletterCampaignFormSchema
} from "../schema.js";
const CAMPAIGN_TEXT_FIELDS = Object.keys(newsletterCampaignFormSchema.shape);
function registerCampaignTextForm() {
  Alpine.data(
    "campaignTextForm",
    (formValues = {}) => {
      return {
        isSubmitting: false,
        ...createFormState(CAMPAIGN_TEXT_FIELDS, formValues),
        init() {
          initFormValues(this, CAMPAIGN_TEXT_FIELDS, true);
        },
        get isDirty() {
          return getIsDirty(this, CAMPAIGN_TEXT_FIELDS);
        },
        validateField(field) {
          return validateField(this, field, newsletterCampaignFormSchema);
        },
        // No field is required — the form is valid as long as the values that
        // were entered pass their format/length checks.
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err);
        },
        submitForm(event) {
          return handleSubmit(this, event, newsletterCampaignFormSchema);
        }
      };
    }
  );
}
export {
  registerCampaignTextForm
};
