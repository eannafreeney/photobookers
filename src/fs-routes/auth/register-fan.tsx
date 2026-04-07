import { createRoute } from "hono-fsr";
import { redirectUrlSchema } from "../../schemas";
import { formValidator, paramValidator } from "../../lib/validator";
import { registerFanFormSchema } from "../../features/auth/schema";
import { RegisterFanFormContext } from "../../features/auth/types";
import { verifyOtpForFanSignup } from "../../features/auth/services";
import { showErrorAlert } from "../../lib/alertHelpers";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen";

export const POST = createRoute(
  paramValidator(redirectUrlSchema),
  formValidator(registerFanFormSchema),
  async (c: RegisterFanFormContext) => {
    const formData = c.req.valid("form");

    const [verifyOtpError] = await verifyOtpForFanSignup(c, formData);
    if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);

    return c.html(
      <FormSuccessScreen
        id="register-form"
        message="Your account has been successfully created. Please check your email for verification."
      />,
    );
  },
);
