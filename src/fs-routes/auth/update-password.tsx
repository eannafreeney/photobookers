import { createRoute } from "hono-fsr";
import { formValidator, queryValidator } from "../../lib/validator";
import {
  recoveryQuerySchema,
  resetPasswordFormSchema,
} from "../../features/auth/schema";
import {
  RecoveryQueryContext,
  ResetPasswordFormContext,
} from "../../features/auth/types";
import {
  getCallbackErrorMessage,
  verifyOtpForRecovery,
} from "../../features/auth/utils";
import {
  clearMustResetPassword,
  loginAndSetCookies,
  setCookiesAndVerifyUser,
} from "../../features/auth/services";
import { showErrorAlert } from "../../lib/alertHelpers";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import Page from "../../components/layouts/Page";
import SetPasswordForm from "../../features/auth/forms/SetPasswordForm";
import InfoPage from "../../pages/InfoPage";
import { getUser, setFlash } from "../../utils";
import { Context } from "hono";
import { supabaseAdmin } from "../../lib/supabase";
import { safeAppRedirect } from "../../lib/safeAppRedirect";

export const GET = createRoute(
  queryValidator(recoveryQuerySchema),
  async (c: RecoveryQueryContext) => {
    const query = c.req.valid("query");
    const tokenHash = query.token_hash;
    const error = query.error;
    const errorCode = query.error_code;
    const errorDescription = query.error_description;

    if (error || errorCode) {
      const message = getCallbackErrorMessage(
        error,
        errorCode,
        errorDescription,
        "recovery",
      );
      return c.html(
        <InfoPage
          errorMessage={message}
          redirectUrl="/auth/forgot-password"
          redirectText="Request a new link"
        />,
      );
    }

    if (tokenHash) {
      const [recoveryError, session] = await verifyOtpForRecovery(c, tokenHash);
      if (recoveryError) {
        return c.html(
          <InfoPage
            errorMessage={getCallbackErrorMessage(
              undefined,
              "otp_expired",
              recoveryError.reason,
              "recovery",
            )}
            redirectUrl="/auth/forgot-password"
            redirectText="Request a new link"
          />,
        );
      }

      await setCookiesAndVerifyUser(c, session);
      return c.redirect("/auth/update-password");
    }

    const user = await getUser(c);
    if (!user) {
      return c.redirect("/auth/forgot-password");
    }

    const redirectUrl = safeAppRedirect(query.redirectUrl ?? null, "/");

    const alpineAttrs = {
      "x-data": "resetPasswordForm()",
      "x-on:submit": "submitForm($event)",
      "x-target": "toast",
      "x-target.away": "_top",
      "x-on:ajax:error": "isSubmitting = false",
    };

    return c.html(
      <HeadlessLayout title="Set New Password">
        <Page>
          <div class="min-h-screen flex items-center justify-center">
            <div class="w-96 my-4 p-6 bg-surface">
              <div class="text-2xl font-bold text-center mb-4">
                Set a new password
              </div>
              <div class="text-sm text-center mb-4">
                Choose a new password for {user.email}.
              </div>
              <form
                action="/auth/update-password"
                method="post"
                {...alpineAttrs}
              >
                <SetPasswordForm
                  buttonText="Update password"
                  loadingText="Updating..."
                  redirectUrl={redirectUrl}
                />
              </form>
            </div>
          </div>
        </Page>
      </HeadlessLayout>,
    );
  },
);

export const POST = createRoute(
  formValidator(resetPasswordFormSchema),
  async (c: ResetPasswordFormContext) => {
    const user = await getUser(c);
    if (!user) {
      return showErrorAlert(
        c,
        "Your reset link has expired. Please request a new one.",
        401,
      );
    }

    const formData = c.req.valid("form");
    if (typeof formData === "string")
      return showErrorAlert(c, "Invalid form data");

    const password = formData.password as string;
    const confirmPassword = formData.confirmPassword as string;

    if (password !== confirmPassword)
      return showErrorAlert(c, "Passwords do not match");
    if (password.length < 8)
      return showErrorAlert(c, "Password must be at least 8 characters");

    const { data: authUserData, error: authUserLookupError } =
      await supabaseAdmin.auth.admin.getUserById(user.id);
    if (authUserLookupError)
      return showErrorAlert(c, authUserLookupError.message);

    const authEmail = authUserData.user?.email ?? user.email;

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });
    if (error) return showErrorAlert(c, error.message);

    const [loginErr] = await loginAndSetCookies(c, authEmail, password);
    if (loginErr) return showErrorAlert(c, loginErr.reason);

    const [setResetPasswordFlagError] = await clearMustResetPassword(user.id);
    if (setResetPasswordFlagError)
      return showErrorAlert(c, setResetPasswordFlagError.reason);

    const next = safeAppRedirect(formData.redirectUrl, "/");

    await setFlash(
      c,
      "success",
      "Your password has been updated successfully!",
    );
    return c.redirect(next);
  },
);
