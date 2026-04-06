import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator";
import { registerCreatorFormSchema } from "../../features/auth/schema";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen";
import { showErrorAlert } from "../../lib/alertHelpers";
import { verifyOtpForCreatorSignup } from "../../features/auth/services";
import { RegisterCreatorFormContext } from "../../features/auth/types";

export const POST = createRoute(
  formValidator(registerCreatorFormSchema),
  async (c: RegisterCreatorFormContext) => {
    const formData = c.req.valid("form");

    const [verifyOtpError] = await verifyOtpForCreatorSignup(c, formData);
    if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);

    return c.html(
      <FormSuccessScreen
        id="register-form"
        message="Your account has been successfully created. Please check your email for verification."
      />,
    );
  },
);
