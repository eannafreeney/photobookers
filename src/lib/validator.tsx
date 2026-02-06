import z from "zod";
import { validator } from "hono/validator";
import { showErrorAlert } from "../routes/booksDashboardRoutes";

export const formValidator = <T extends z.ZodSchema>(schema: T) => {
  return validator("form", (formData, c) => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      console.log("result.error", result.error);
      return showErrorAlert(c, "Schema validation failed");
    }
    return result.data as z.infer<T>;
  });
};

export const paramValidator = <T extends z.ZodSchema>(schema: T) => {
  return validator("param", (params, c) => {
    const result = schema.safeParse(params);
    if (!result.success) {
      return showErrorAlert(c, "Invalid parameters");
    }
    return result.data as z.infer<T>;
  });
};

// export type ValidatedFile = {
//   arrayBuffer: () => Promise<ArrayBuffer>;
//   name: string;
//   type: string;
//   size: number;
// };

export type FileValidationResult =
  | { success: true; file: File }
  | { success: false; error: string };

export function validateImageFile(
  file: unknown,
  options?: { maxSize?: number }
): FileValidationResult {
  const maxSize = options?.maxSize ?? 5 * 1024 * 1024; // 5MB default

  // Duck-type check instead of instanceof File
  const isFile =
    file &&
    typeof file === "object" &&
    "arrayBuffer" in file &&
    "name" in file &&
    "type" in file;

  if (!isFile) {
    return { success: false, error: "Please select an image file" };
  }

  const validFile = file as File;

  if (validFile.size > maxSize) {
    return {
      success: false,
      error: `File too large (max ${maxSize / 1024 / 1024}MB)`,
    };
  }

  if (!validFile.type.startsWith("image/")) {
    return { success: false, error: "Please upload an image file" };
  }

  return { success: true, file: validFile };
}
