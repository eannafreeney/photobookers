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
  setCookiesAndVerifyUser,
} from "../../features/auth/services";
import { safeAppRedirect } from "../../lib/safeAppRedirect";
import { supabaseAdmin } from "../../lib/supabase";
import { createUserVerifiedNotification } from "../../features/dashboard/admin/notifications/utils";
import { supabaseAnon } from "../../lib/supabase";
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

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) return showErrorAlert(c, error.message);

    const [setResetPasswordFlagError] = await clearMustResetPassword(user.id);
    if (setResetPasswordFlagError)
      return showErrorAlert(c, setResetPasswordFlagError.reason);

    // generate verification welcome email if user was forced to reset password and is not in modal
    if (wasForcedResetPassword && !isModal) {
      const { data: authUser, error: authUserError } =
        await supabaseAdmin.auth.admin.getUserById(user.id);
      if (authUserError) {
        console.error(
          "Deferred welcome email: getUserById failed:",
          authUserError,
        );
      } else if (authUser.user?.user_metadata.claimIntent === true) {
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

    const welcomeName = user.creator?.displayName ?? user.firstName ?? "A user";

    if (wasForcedResetPassword) {
      await createUserVerifiedNotification(welcomeName, user);
    }

    const { data } = await supabaseAnon.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (!data.session) return showErrorAlert(c, "Failed to sign in");

    await setCookiesAndVerifyUser(c, data.session);

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
