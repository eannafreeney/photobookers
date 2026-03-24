import Alpine from "alpinejs";
    import { addCommentFormSchema } from "../schema";
import { handleSubmit } from "../../../client/forms/formUtils";

export function registerCommentForm() {
    Alpine.data(
        "commentForm",
        ({ initialValues }: { initialValues?: { body?: string } } = {}) => {
  

    return {
      isSubmitting: false,
      body: initialValues?.body ?? "",
    

      get isFormValid() {
        return (
          this.body &&
          this.body.trim().length > 7 &&
          this.body.trim().length <= 1000
        );
      },    

      submitForm(event: Event) {
        return handleSubmit(this, event, addCommentFormSchema);
      },
    };
  });
}
