import Alpine from "alpinejs";
import z from "zod";
import { listFormEditSchema, listFormSchema } from "../schema";
import {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField,
} from "../../../../client/forms/formUtils";

type ListFormData = z.infer<typeof listFormSchema>;

type ListFormThis = {
  isEditMode: boolean;
  form: Partial<ListFormData> & Record<string, unknown>;
  initialValues: { form: Record<string, unknown> };
  errors: { form: Record<string, string> };
  isDirty: boolean;
};

const LIST_FORM_FIELDS = ["title", "description", "slug"] as const;

export function registerListForm() {
  Alpine.data(
    "listForm",
    (formValues: Partial<ListFormData> = {}, isEditMode: boolean = false) => {
      const state = createFormState([...LIST_FORM_FIELDS], formValues);

      return {
        isSubmitting: false,
        isEditMode,
        ...state,
        form: {
          ...state.form,
          isPublic: formValues.isPublic ?? false,
        },

        init() {
          const ctx = this as unknown as ListFormThis;
          initFormValues(ctx, [...LIST_FORM_FIELDS], isEditMode);
          ctx.form.isPublic = formValues.isPublic ?? false;
          ctx.initialValues.form.isPublic = isEditMode
            ? (formValues.isPublic ?? false)
            : false;
          if (!isEditMode) {
            ctx.form.isPublic = false;
          }
        },

        get isDirty() {
          const ctx = this as unknown as ListFormThis;
          return (
            getIsDirty(ctx, [...LIST_FORM_FIELDS]) ||
            ctx.form.isPublic !== ctx.initialValues.form.isPublic
          );
        },

        validateField(field: string) {
          const ctx = this as unknown as ListFormThis;
          const schema = ctx.isEditMode ? listFormEditSchema : listFormSchema;
          return validateField(ctx, field, schema);
        },

        get isFormValid() {
          const ctx = this as unknown as ListFormThis;
          const titleValid = !!String(ctx.form.title ?? "").trim();
          const slugValid =
            !ctx.isEditMode || !!String(ctx.form.slug ?? "").trim();
          const errorsClear = Object.values(ctx.errors.form).every(
            (err) => !err,
          );
          return ctx.isDirty && errorsClear && titleValid && slugValid;
        },

        submitForm(event: Event) {
          const ctx = this as unknown as ListFormThis;
          const schema = ctx.isEditMode ? listFormEditSchema : listFormSchema;
          return handleSubmit(ctx, event, schema);
        },

        onSuccess() {
          const ctx = this as unknown as ListFormThis;
          if (!isEditMode) {
            ctx.form.title = "";
            ctx.form.description = "";
            ctx.form.slug = "";
            ctx.form.isPublic = false;
          }
          resetFormBaseline(ctx, [...LIST_FORM_FIELDS]);
          ctx.initialValues.form.isPublic = ctx.form.isPublic;
        },
      };
    },
  );
}
