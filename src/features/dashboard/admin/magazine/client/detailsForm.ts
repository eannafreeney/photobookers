import Alpine from "alpinejs";
import {
  handleSubmit,
  createFormState,
  validateField,
  initFormValues,
} from "../../../../../client/forms/formUtils";
import {
  MagazineDetailsFormSchema,
  magazineDetailsFormSchema,
} from "../schema";

const DETAILS_FORM_FIELDS = Object.keys(magazineDetailsFormSchema.shape);

export function registerMagazineDetailsForm() {
  Alpine.data(
    "magazineDetailsForm",
    (
      formValues: Partial<MagazineDetailsFormSchema> = {},
      regenerateTitleUrl: string = "",
    ) => {
      return {
        isSubmitting: false,
        regeneratingTitle: false,
        titleError: "",
        ...createFormState(DETAILS_FORM_FIELDS, formValues),

        init() {
          initFormValues(this, DETAILS_FORM_FIELDS, true);
        },

        async regenerateTitle() {
          const ctx = this as unknown as {
            form: Record<string, string>;
            regeneratingTitle: boolean;
            titleError: string;
          };
          if (ctx.regeneratingTitle || !regenerateTitleUrl) return;
          ctx.regeneratingTitle = true;
          ctx.titleError = "";
          try {
            const res = await fetch(regenerateTitleUrl, {
              method: "POST",
              headers: { Accept: "application/json" },
            });
            const data = (await res.json()) as {
              title?: string;
              error?: string;
            };
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

        validateField(field: string) {
          return validateField(this, field, magazineDetailsFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<string, string> };
            form: Record<string, string>;
          };
          return (
            Object.values(ctx.errors.form).every((err) => !err) &&
            Boolean(ctx.form.title?.trim())
          );
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, magazineDetailsFormSchema);
        },
      };
    },
  );
}
