import Alpine from "alpinejs";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../../client/forms/formUtils";
import {
  NewsletterCampaignFormSchema,
  newsletterCampaignFormSchema,
} from "../../schema";

const CAMPAIGN_TEXT_FIELDS = Object.keys(newsletterCampaignFormSchema.shape);

export function registerCampaignTextForm() {
  Alpine.data(
    "campaignTextForm",
    (formValues: Partial<NewsletterCampaignFormSchema> = {}) => {
      return {
        isSubmitting: false,

        ...createFormState(CAMPAIGN_TEXT_FIELDS, formValues),

        init() {
          initFormValues(this, CAMPAIGN_TEXT_FIELDS, true);
        },

        get isDirty() {
          return getIsDirty(this, CAMPAIGN_TEXT_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, newsletterCampaignFormSchema);
        },

        // No field is required — the form is valid as long as the values that
        // were entered pass their format/length checks.
        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
          };
          return Object.values(ctx.errors.form).every((err) => !err);
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, newsletterCampaignFormSchema);
        },
      };
    },
  );
}
