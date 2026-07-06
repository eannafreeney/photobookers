import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator.js";
import { resetPasswordFormSchema } from "../../features/auth/schema.js";
import ResetPasswordModal from "../../features/auth/modals/ResetPasswordModal.js";
import { getUser, setFlash } from "../../utils.js";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers.js";
import {
  getMustResetPasswordState,
  clearMustResetPassword,
  loginAndSetCookies
} from "../../features/auth/services.js";
import { safeAppRedirect } from "../../lib/safeAppRedirect.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { createUserVerifiedNotification } from "../../domain/notifications/utils.js";
import { generateVerificationWelcomeEmail } from "../../features/auth/emails.js";
import { sendEmail } from "../../lib/sendEmail.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/auth/login");
  return c.html(/* @__PURE__ */ jsx(ResetPasswordModal, {}));
});
const POST = createRoute(
  formValidator(resetPasswordFormSchema),
  async (c) => {
    const user = await getUser(c);
    if (!user) return c.redirect("/auth/login");
    const formData = c.req.valid("form");
    if (typeof formData === "string")
      return showErrorAlert(c, "Invalid form data");
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const isModal = formData.isModal;
    if (password !== confirmPassword)
      return showErrorAlert(c, "Passwords do not match");
    if (password.length < 8)
      return showErrorAlert(c, "Password must be at least 8 characters");
    const [wasForcedResetPasswordError, wasForcedResetPassword] = await getMustResetPasswordState(user.id);
    if (wasForcedResetPasswordError)
      return showErrorAlert(c, wasForcedResetPasswordError.reason);
    const { data: authUserData, error: authUserLookupError } = await supabaseAdmin.auth.admin.getUserById(user.id);
    if (authUserLookupError)
      return showErrorAlert(c, authUserLookupError.message);
    const authEmail = authUserData.user?.email ?? user.email;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password
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
          "You're verified \u2013 welcome to Photobookers",
          generateVerificationWelcomeEmail(emailWelcomeName, null)
        );
        if (emailError) {
          console.error(
            "Deferred verification welcome email failed:",
            emailError.reason
          );
        }
      }
    }
    if (wasForcedResetPassword) {
      const welcomeName = user.creator?.displayName ?? user.firstName ?? "A user";
      await createUserVerifiedNotification(welcomeName, user);
    }
    if (isModal) {
      return showSuccessAlert(
        c,
        "Your password has been updated successfully!"
      );
    }
    const next = safeAppRedirect(formData.redirectUrl, "/");
    await setFlash(
      c,
      "success",
      "Your password has been updated successfully!"
    );
    return c.redirect(next);
  }
);
export {
  GET,
  POST
};
