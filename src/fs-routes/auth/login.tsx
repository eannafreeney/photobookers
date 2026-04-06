import { createRoute } from "hono-fsr";
import { redirectUrlSchema } from "../../schemas";
import { formValidator, paramValidator } from "../../lib/validator";
import { loginFormSchema } from "../../features/auth/schema";
import { Context } from "hono";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import LoginForm from "../../features/auth/forms/LoginForm";
import { getFlash, getUser } from "../../utils";
import {
  checkIfUserWasForcedToResetPassword,
  loginAndSetCookies,
} from "../../features/auth/services";
import { LoginFormContext } from "../../features/auth/types";
import { showErrorAlert } from "../../lib/alertHelpers";

export const GET = createRoute(async (c: Context) => {
  const redirectUrl = c.req.query("redirectUrl") ?? null;
  const user = await getUser(c);
  const flash = await getFlash(c);
  if (user) return c.redirect("/");

  return c.html(
    <HeadlessLayout title="Sign In" flash={flash}>
      <div class="min-h-screen flex items-center justify-center bg-surface px-4">
        <div class="w-96">
          <h2 class="text-2xl font-bold mb-4">Sign In</h2>
          <LoginForm redirectUrl={redirectUrl} />
        </div>
      </div>
    </HeadlessLayout>,
  );
});

export const POST = createRoute(
  paramValidator(redirectUrlSchema),
  formValidator(loginFormSchema),
  async (c: LoginFormContext) => {
    const formData = c.req.valid("form");
    const redirectUrl = c.req.valid("param").redirectUrl;
    const email = formData.email as string;
    const password = formData.password as string;
    const result = await loginAndSetCookies(c, email, password);

    const safeRedirectUrl =
      redirectUrl && redirectUrl !== "undefined" ? redirectUrl : "/";

    if ("error" in result)
      return showErrorAlert(c, "Invalid email or password", 401);

    const [wasForcedResetPasswordError, wasForcedResetPassword] =
      await checkIfUserWasForcedToResetPassword(result.userId);
    if (wasForcedResetPasswordError)
      return showErrorAlert(c, wasForcedResetPasswordError.reason);

    if (wasForcedResetPassword) {
      return c.redirect("/auth/force-reset-password");
    }
    return c.redirect(safeRedirectUrl ?? "/");
  },
);
