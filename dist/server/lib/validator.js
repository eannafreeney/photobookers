import { jsx } from "hono/jsx/jsx-runtime";
import { validator } from "hono/validator";
import Alert from "../components/app/Alert.js";
import InfoPage from "../pages/InfoPage.js";
import { getUser } from "../utils.js";
const formValidator = (schema) => {
  return validator("form", async (formData, c) => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: "Schema validation failed" }));
    }
    return result.data;
  });
};
const paramValidator = (schema) => {
  return validator("param", async (params, c) => {
    const result = schema.safeParse(params);
    if (!result.success) {
      const user = await getUser(c);
      const message = "Oops! Something went wrong.";
      console.log("error", result.error);
      if (c.req.method === "GET") {
        return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: message, user }), 400);
      }
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message }));
    }
    return result.data;
  });
};
const queryValidator = (schema) => {
  return validator("query", async (query, c) => {
    const result = schema.safeParse(query);
    if (!result.success) {
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: "Query validation failed" }));
    }
    return result.data;
  });
};
function validateImageFile(file, options) {
  const maxSize = options?.maxSize ?? 5 * 1024 * 1024;
  const isFile = file && typeof file === "object" && "arrayBuffer" in file && "name" in file && "type" in file;
  if (!isFile) {
    return { success: false, error: "Please select an image file" };
  }
  const validFile = file;
  if (validFile.size > maxSize) {
    return {
      success: false,
      error: `File too large (max ${maxSize / 1024 / 1024}MB)`
    };
  }
  if (!validFile.type.startsWith("image/")) {
    return { success: false, error: "Please upload an image file" };
  }
  return { success: true, file: validFile };
}
export {
  formValidator,
  paramValidator,
  queryValidator,
  validateImageFile
};
