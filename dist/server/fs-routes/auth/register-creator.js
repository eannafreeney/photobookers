import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator.js";
import { registerCreatorFormSchema } from "../../features/auth/schema.js";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import { verifyOtpForCreatorSignup } from "../../features/auth/services.js";
const POST = createRoute(
  formValidator(registerCreatorFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const [verifyOtpError] = await verifyOtpForCreatorSignup(c, formData);
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
