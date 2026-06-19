import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator";
import { forgotPasswordFormSchema } from "../../features/auth/schema";
import { ForgotPasswordFormContext } from "../../features/auth/types";
import { sendPasswordResetEmail } from "../../features/auth/services";
import { showErrorAlert } from "../../lib/alertHelpers";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import ForgotPasswordForm from "../../features/auth/forms/ForgotPasswordForm";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen";
import { Context } from "hono";
import { getUser } from "../../utils";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (user) return c.redirect("/");

  return c.html(
    <HeadlessLayout title="Forgot Password">
      <div class="min-h-screen flex items-center justify-center bg-surface px-4">
        <div class="w-96">
          <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4 mb-6">
            <span class="kicker text-accent">Account recovery</span>
            <h2 class="font-display text-3xl font-medium text-on-surface-strong">
              Forgot password
            </h2>
            <p class="text-sm text-on-surface mt-2">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </HeadlessLayout>,
  );
});

export const POST = createRoute(
  formValidator(forgotPasswordFormSchema),
  async (c: ForgotPasswordFormContext) => {
    const formData = c.req.valid("form");
    const email = (formData.email as string).trim().toLowerCase();

    const [sendError] = await sendPasswordResetEmail(email);
    if (sendError) {
      return showErrorAlert(
        c,
        "Something went wrong. Please try again later.",
        500,
      );
    }

    return c.html(
      <FormSuccessScreen
        id="forgot-password-form"
        message="If an account exists for that email, we've sent a password reset link. Check your inbox and spam folder."
      />,
    );
  },
);
