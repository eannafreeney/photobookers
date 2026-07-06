import Alpine from "alpinejs";
import { addCommentFormSchema } from "../schema.js";
import { handleSubmit } from "../../../client/forms/formUtils.js";
function registerCommentForm() {
  Alpine.data(
    "commentForm",
    ({ initialValues } = {}) => {
      return {
        isSubmitting: false,
        body: initialValues?.body ?? "",
        get isFormValid() {
          return this.body && this.body.trim().length > 7 && this.body.trim().length <= 1e3;
        },
        submitForm(event) {
          return handleSubmit(this, event, addCommentFormSchema);
        }
      };
    }
  );
}
export {
  registerCommentForm
};
