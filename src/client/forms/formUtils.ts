// Shared form utilities

export function createFormState<T extends string[]>(
  fields: T,
  formValues: Record<string, any> = {},
) {
  return {
    form: Object.fromEntries(fields.map((key) => [key, formValues[key] ?? ""])),
    initialValues: { form: {} as Record<string, any> },
    errors: { form: {} as Record<string, string> },
  };
}

export function initFormValues<T extends string[]>(
  context: any,
  fields: T,
  isEditMode: boolean = false,
) {
  if (isEditMode) {
    context.initialValues.form = Object.fromEntries(
      fields.map((key) => [key, context.form[key]]),
    );
  } else {
    context.initialValues.form = Object.fromEntries(
      fields.map((key) => [key, ""]),
    );
  }
}

export function getIsDirty<T extends string[]>(context: any, fields: T) {
  return fields.some(
    (key) => context.form[key] !== context.initialValues.form[key],
  );
}

export function resetFormBaseline<T extends string[]>(context: any, fields: T) {
  context.isSubmitting = false;
  context.initialValues.form = Object.fromEntries(
    fields.map((key) => [key, context.form[key]]),
  );
}

import { z } from "zod";

export function validateField(
  context: any,
  field: string,
  schema: z.ZodSchema,
) {
  const result = schema.safeParse(context.form);
  const fieldError = result.error?.flatten().fieldErrors[field];

  if (fieldError && fieldError[0]) {
    context.errors.form[field] = fieldError[0];
  } else {
    delete context.errors.form[field];
  }
}

export function handleSubmit(
  context: any,
  event: Event,
  schema: z.ZodSchema,
): boolean {
  context.isSubmitting = true;
  const result = schema.safeParse(context.form);
  console.log("result", result);

  if (!result.success) {
    event.preventDefault();
    context.isSubmitting = false;
    context.errors.globalError = "Invalid Input";
    return false;
  }

  return true;
}
