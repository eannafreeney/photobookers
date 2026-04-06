import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator";
import { resetPasswordFormSchema } from "../../features/auth/schema";
import ResetPasswordModal from "../../features/auth/modals/ResetPasswordModal";
import { getUser, setFlash } from "../../utils";
import { Context } from "hono";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers";
import { ResetPasswordFormContext } from "../../features/auth/types";
import {
  checkWasForcedResetPassword,
  clearMustResetPassword,
} from "../../features/auth/services";
import { supabaseAdmin } from "../../lib/supabase";
import { createUserVerifiedNotification } from "../../features/dashboard/admin/notifications/utils";
import { supabaseAnon } from "../../lib/supabase";
import { setCookiesAndVerifyUser } from "../../features/auth/services";

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
      await checkWasForcedResetPassword(user.id);
    if (wasForcedResetPasswordError)
      return showErrorAlert(c, wasForcedResetPasswordError.reason);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) return showErrorAlert(c, error.message);

    const [setResetPasswordFlagError] = await clearMustResetPassword(user.id);
    if (setResetPasswordFlagError)
      return showErrorAlert(c, setResetPasswordFlagError.reason);

    if (wasForcedResetPassword) {
      await createUserVerifiedNotification(user);
    }

    const { data } = await supabaseAnon.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (!data.session) return showErrorAlert(c, "Failed to sign in");

    await setCookiesAndVerifyUser(c, data.session);

    if (isModal) {
      console.log("formData.isModal", formData.isModal);
      return showSuccessAlert(
        c,
        "Your password has been updated successfully!",
      );
    }

    await setFlash(
      c,
      "success",
      "Your password has been updated successfully!",
    );
    return c.redirect("/");
  },
);
