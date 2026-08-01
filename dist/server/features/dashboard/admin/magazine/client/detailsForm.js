import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues
} from "../../../../../client/forms/formUtils.js";
import {
  magazineDetailsFormSchema
} from "../schema.js";
const DETAILS_FORM_FIELDS = Object.keys(magazineDetailsFormSchema.shape);
function registerMagazineDetailsForm() {
  Alpine.data(
    "magazineDetailsForm",
    (formValues = {}, regenerateTitleUrl = "") => {
      return {
        isSubmitting: false,
        regeneratingTitle: false,
        titleError: "",
        ...createFormState(DETAILS_FORM_FIELDS, formValues),
        init() {
          initFormValues(this, DETAILS_FORM_FIELDS, true);
        },
        async regenerateTitle() {
          const ctx = this;
          if (ctx.regeneratingTitle || !regenerateTitleUrl) return;
          ctx.regeneratingTitle = true;
          ctx.titleError = "";
          try {
            const res = await fetch(regenerateTitleUrl, {
              method: "POST",
              headers: { Accept: "application/json" }
            });
            const data = await res.json();
            if (!res.ok || !data.title) {
              ctx.titleError = data.error ?? "Couldn't regenerate the title.";
              return;
            }
            ctx.form.title = data.title;
          } catch {
            ctx.titleError = "Couldn't regenerate the title.";
          } finally {
            ctx.regeneratingTitle = false;
          }
        },
        validateField(field) {
          return validateField(this, field, magazineDetailsFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          return Object.values(ctx.errors.form).every((err) => !err) && Boolean(ctx.form.title?.trim());
        },
        submitForm(event) {
          return handleSubmit(this, event, magazineDetailsFormSchema);
        }
      };
    }
  );
}
export {
  registerMagazineDetailsForm
};
