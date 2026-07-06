import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { redirectUrlSchema } from "../../schemas/index.js";
import { formValidator, paramValidator } from "../../lib/validator.js";
import { registerFanFormSchema } from "../../features/auth/schema.js";
import { verifyOtpForFanSignup } from "../../features/auth/services.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen.js";
const POST = createRoute(
  paramValidator(redirectUrlSchema),
  formValidator(registerFanFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const [verifyOtpError] = await verifyOtpForFanSignup(c, formData);
    if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);
    return c.html(
      /* @__PURE__ */ jsx(
        FormSuccessScreen,
        {
          id: "register-form",
          message: "Your account has been successfully created. Please check your email for verification."
        }
      )
    );
  }
);
export {
  POST
};
