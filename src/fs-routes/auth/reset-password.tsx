import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator";
import { resetPasswordFormSchema } from "../../features/auth/schema";
import ResetPasswordModal from "../../features/auth/modals/ResetPasswordModal";
import { getUser, setFlash } from "../../utils";
import { Context } from "hono";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers";
import { ResetPasswordFormContext } from "../../features/auth/types";
import {
  getMustResetPasswordState,
  clearMustResetPassword,
  loginAndSetCookies,
} from "../../features/auth/services";
import { safeAppRedirect } from "../../lib/safeAppRedirect";
import { supabaseAdmin } from "../../lib/supabase";
import { createUserVerifiedNotification } from "../../domain/notifications/utils";
import { generateVerificationWelcomeEmail } from "../../features/auth/emails";
import { sendEmail } from "../../lib/sendEmail";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");
  return c.html(<ResetPasswordModal />);
});

export const POST = createRoute(
  formValidator(resetPasswordFormSchema),
  async (c: ResetPasswordFormContext) => {
    const user = await getUser(c);
    if (!user) return c.redirect("/auth/login");

    const formData = c.req.valid("form");
    if (typeof formData === "string")
      return showErrorAlert(c, "Invalid form data");

    const password = formData.password as string;
    const confirmPassword = formData.confirmPassword as string;
    const isModal = formData.isModal as boolean;

    if (password !== confirmPassword)
      return showErrorAlert(c, "Passwords do not match");
    if (password.length < 8)
      return showErrorAlert(c, "Password must be at least 8 characters");

    const [wasForcedResetPasswordError, wasForcedResetPassword] =
      await getMustResetPasswordState(user.id);
    if (wasForcedResetPasswordError)
      return showErrorAlert(c, wasForcedResetPasswordError.reason);

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

    if (wasForcedResetPassword && !isModal) {
      if (authUserData.user?.user_metadata.claimIntent === true) {
        const emailWelcomeName = user.firstName ?? "there";
        const [emailError] = await sendEmail(
          user.email,
          "You're verified – welcome to Photobookers",
          generateVerificationWelcomeEmail(emailWelcomeName, null),
        );
        if (emailError) {
          console.error(
            "Deferred verification welcome email failed:",
            emailError.reason,
          );
        }
      }
    }

    if (wasForcedResetPassword) {
      const welcomeName =
        user.creator?.displayName ?? user.firstName ?? "A user";
      await createUserVerifiedNotification(welcomeName, user);
    }

    if (isModal) {
      return showSuccessAlert(
        c,
        "Your password has been updated successfully!",
      );
    }

    const next = safeAppRedirect(formData.redirectUrl, "/");

    await setFlash(
      c,
      "success",
      "Your password has been updated successfully!",
    );
    return c.redirect(next);
  },
);
