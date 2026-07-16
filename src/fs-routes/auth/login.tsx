import { createRoute } from "hono-fsr";
import { redirectUrlSchema } from "../../schemas";
import { formValidator, queryValidator } from "../../lib/validator";
import { loginFormSchema } from "../../features/auth/schema";
import { Context } from "hono";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import LoginForm from "../../features/auth/forms/LoginForm";
import { getFlash, getUser } from "../../utils";
import {
  getMustResetPasswordState,
  loginAndSetCookies,
} from "../../features/auth/services";
import { LoginFormContext } from "../../features/auth/types";
import { showErrorAlert } from "../../lib/alertHelpers";
import { safeAppRedirect } from "../../lib/safeAppRedirect";
import {
  clearLoginAttempts,
  loginRateLimit,
} from "../../middleware/loginRateLimit";

export const GET = createRoute(async (c: Context) => {
  const redirectUrl = c.req.query("redirectUrl") ?? null;
  const user = await getUser(c);
  const flash = await getFlash(c);
  if (user) return c.redirect(safeAppRedirect(redirectUrl, "/"));

  return c.html(
    <HeadlessLayout title="Sign In" flash={flash}>
      <div class="min-h-screen flex items-center justify-center bg-surface px-4">
        <div class="w-96">
          <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4 mb-6">
            <span class="kicker text-accent">Welcome Back</span>
            <h2 class="font-display text-3xl font-medium text-on-surface-strong">
              Sign In
            </h2>
          </div>
          <LoginForm redirectUrl={redirectUrl} />
        </div>
      </div>
    </HeadlessLayout>,
  );
});

export const POST = createRoute(
  loginRateLimit,
  queryValidator(redirectUrlSchema),
  formValidator(loginFormSchema),
  async (c: LoginFormContext) => {
    const formData = c.req.valid("form");
    const redirectUrl = c.req.valid("query").redirectUrl;
    const email = (formData.email as string).trim().toLowerCase();
    const password = formData.password as string;
    const [loginErr, login] = await loginAndSetCookies(c, email, password);

    const afterLoginUrl = safeAppRedirect(redirectUrl, "/");
    if (loginErr) return showErrorAlert(c, "Invalid email or password", 401);

    // Successful credential check — reset the throttle for this IP.
    clearLoginAttempts(c);

    const [wasForcedResetPasswordError, wasForcedResetPassword] =
      await getMustResetPasswordState(login.userId);
    if (wasForcedResetPasswordError)
      return showErrorAlert(c, wasForcedResetPasswordError.reason);

    if (wasForcedResetPassword) {
      return c.redirect(
        `/auth/force-reset-password?redirectUrl=${encodeURIComponent(afterLoginUrl)}`,
      );
    }

    return c.redirect(afterLoginUrl);
  },
);
