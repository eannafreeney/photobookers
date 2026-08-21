import Alpine from "alpinejs";
import { listBookNoteFormSchema } from "../schema.js";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
} from "../../../../client/forms/formUtils.js";
import { commentBodyAsListNote } from "../../../../domain/lists/utils.js";
const NOTE_FORM_FIELDS = ["note"];
function registerListBookNoteForm() {
  Alpine.data(
    "listBookNoteForm",
    (formValues = {}, comments = []) => {
      const state = createFormState([...NOTE_FORM_FIELDS], formValues);
      return {
        isSubmitting: false,
        comments,
        ...state,
        init() {
          initFormValues(this, [...NOTE_FORM_FIELDS], true);
        },
        get isDirty() {
          return getIsDirty(this, [...NOTE_FORM_FIELDS]);
        },
        validateField(field) {
          return validateField(this, field, listBookNoteFormSchema);
        },
        useCommentAt(index) {
          const ctx = this;
          const body = ctx.comments[index];
          if (body == null) return;
          ctx.form.note = commentBodyAsListNote(body);
          validateField(ctx, "note", listBookNoteFormSchema);
        },
        get isFormValid() {
          const ctx = this;
          const errorsClear = Object.values(ctx.errors.form).every(
            (err) => !err
          );
          return getIsDirty(ctx, [...NOTE_FORM_FIELDS]) && errorsClear;
        },
        submitForm(event) {
          return handleSubmit(this, event, listBookNoteFormSchema);
        },
        onSuccess() {
          resetFormBaseline(this, [...NOTE_FORM_FIELDS]);
        }
      };
    }
  );
}
export {
  registerListBookNoteForm
};
