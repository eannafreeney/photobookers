function createFormState(fields, formValues = {}) {
  return {
    form: Object.fromEntries(fields.map((key) => [key, formValues[key] ?? ""])),
    initialValues: { form: {} },
    errors: { form: {} }
  };
}
function initFormValues(context, fields, isEditMode = false) {
  if (isEditMode) {
    context.initialValues.form = Object.fromEntries(
      fields.map((key) => [key, context.form[key]])
    );
  } else {
    context.initialValues.form = Object.fromEntries(
      fields.map((key) => [key, ""])
    );
  }
}
function getIsDirty(context, fields) {
  return fields.some(
    (key) => context.form[key] !== context.initialValues.form[key]
  );
}
function resetFormBaseline(context, fields) {
  context.isSubmitting = false;
  context.initialValues.form = Object.fromEntries(
    fields.map((key) => [key, context.form[key]])
  );
}
function validateField(context, field, schema) {
  const result = schema.safeParse(context.form);
  const fieldErrors = result.error?.flatten().fieldErrors;
  const fieldError = fieldErrors?.[field];
  if (fieldError?.[0]) {
    context.errors.form[field] = fieldError[0];
  } else {
    delete context.errors.form[field];
  }
}
function handleSubmit(context, event, schema) {
  context.isSubmitting = true;
  const result = schema.safeParse(context.form);
  if (!result.success) {
    event.preventDefault();
    context.isSubmitting = false;
    context.errors.globalError = "Invalid Input";
    return false;
  }
  return true;
}
export {
  createFormState,
  getIsDirty,
  handleSubmit,
  initFormValues,
  resetFormBaseline,
  validateField
};
