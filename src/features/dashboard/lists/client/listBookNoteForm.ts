import Alpine from "alpinejs";
import z from "zod";
import { listBookNoteFormSchema } from "../schema";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../client/forms/formUtils";

type ListBookNoteFormData = z.infer<typeof listBookNoteFormSchema>;

type ListBookNoteFormThis = {
  form: Partial<ListBookNoteFormData> & Record<string, unknown>;
  initialValues: { form: Record<string, unknown> };
  errors: { form: Record<string, string> };
};

const NOTE_FORM_FIELDS = ["note"] as const;

export function registerListBookNoteForm() {
  Alpine.data(
    "listBookNoteForm",
    (formValues: Partial<ListBookNoteFormData> = {}) => {
      const state = createFormState([...NOTE_FORM_FIELDS], formValues);

      return {
        isSubmitting: false,
        ...state,

        init() {
          initFormValues(this, [...NOTE_FORM_FIELDS], true);
        },

        get isDirty() {
          return getIsDirty(this, [...NOTE_FORM_FIELDS]);
        },

        validateField(field: string) {
          return validateField(this, field, listBookNoteFormSchema);
        },

        get isFormValid() {
          const ctx = this as unknown as ListBookNoteFormThis;
          const errorsClear = Object.values(ctx.errors.form).every(
            (err) => !err,
          );
          return getIsDirty(ctx, [...NOTE_FORM_FIELDS]) && errorsClear;
        },

        submitForm(event: Event) {
          return handleSubmit(this, event, listBookNoteFormSchema);
        },

        onSuccess() {
          resetFormBaseline(this, [...NOTE_FORM_FIELDS]);
        },
      };
    },
  );
}
