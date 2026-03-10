import Alpine from "alpinejs";
import { featuredBooksFormSchema } from "../schema";
import z from "zod";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  validateField,
} from "../../../../../client/forms/formUtils";

export type FeaturedFormData = z.infer<typeof featuredBooksFormSchema>;

const FEATURED_FIELDS = Object.keys(featuredBooksFormSchema.shape);

export function registerFeaturedForm() {
  Alpine.data(
    "featuredForm",
    (formValues: FeaturedFormData, isEditMode: boolean = false) => {
      return {
        isSubmitting: false,

        ...createFormState(FEATURED_FIELDS, formValues),

        init() {
          initFormValues(this, FEATURED_FIELDS, isEditMode);
        },

        get isDirty() {
          return getIsDirty(this, FEATURED_FIELDS);
        },

        validateField(field: string) {
          return validateField(this, field, featuredBooksFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as {
            errors: { form: Record<keyof FeaturedFormData, string> };
            form: FeaturedFormData;
          };

          const isValid =
            Object.values(ctx.errors.form).every((err) => !err) &&
            ctx.form.bookId1 &&
            ctx.form.bookId2 &&
            ctx.form.bookId3 &&
            ctx.form.bookId4 &&
            ctx.form.bookId5;
          console.log("isValid", isValid);
          console.log("errors", ctx.errors.form);
          console.log("form", ctx.form);
          return isValid;
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, featuredBooksFormSchema);
        },
      };
    },
  );
}
