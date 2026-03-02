import Alpine from "alpinejs";
import { claimFormSchema } from "../../features/claims/schema";
import z from "zod";
import { bookFormAdminSchema } from "../../features/dashboard/admin/books/schema";
import { handleSubmit } from "./formUtils";

type ClaimFormShape = z.infer<typeof claimFormSchema>;

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

      validateField(field: string) {
        const result = bookFormAdminSchema.safeParse(this.form);
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
        return handleSubmit(this, event, claimFormSchema);
      },
    };
  });
}
