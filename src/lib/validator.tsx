import z from "zod";
import { validator } from "hono/validator";
import Alert from "../components/app/Alert";
import InfoPage from "../pages/InfoPage";
import { getUser } from "../utils";

export const formValidator = <T extends z.ZodSchema>(schema: T) => {
  return validator("form", async (formData, c) => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      return c.html(<Alert type="danger" message="Schema validation failed" />);
    }

    return result.data as z.infer<T>;
  });
};

export const paramValidator = <T extends z.ZodSchema>(schema: T) => {
  return validator("param", async (params, c) => {
    const result = schema.safeParse(params);
    if (!result.success) {
      const user = await getUser(c);
      const message = "Parameter validation failed";
      if (c.req.method === "GET") {
        return c.html(<InfoPage errorMessage={message} user={user} />, 400);
      }
      return c.html(<Alert type="danger" message={message} />);
    }
    return result.data as z.infer<T>;
  });
};

export const queryValidator = <T extends z.ZodSchema>(schema: T) => {
  return validator("query", async (query, c) => {
    const result = schema.safeParse(query);
    if (!result.success) {
      return c.html(<Alert type="danger" message="Query validation failed" />);
    }
    return result.data as z.infer<T>;
  });
};

export type FileValidationResult =
  | { success: true; file: File }
  | { success: false; error: string };

export function validateImageFile(
  file: unknown,
  options?: { maxSize?: number },
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
