import { jsx } from "hono/jsx/jsx-runtime";
import Alert from "../components/app/Alert.js";
const showErrorAlert = (c, errorMessage = "Action Failed! Please try again.", errorCode = 422) => c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: errorMessage }), errorCode);
const showSuccessAlert = (c, errorMessage = "Action Complete!") => c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: errorMessage }));
export {
  showErrorAlert,
  showSuccessAlert
};
