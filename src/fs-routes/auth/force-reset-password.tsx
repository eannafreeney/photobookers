import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import { Context } from "hono";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import Page from "../../components/layouts/Page";
import SetPasswordForm from "../../features/auth/forms/SetPasswordForm";
import { safeAppRedirect } from "../../lib/safeAppRedirect";

export const GET = createRoute(async (c: Context) => {
  const q = c.req.query("redirectUrl");
  const safeRedirectUrl = safeAppRedirect(q ?? null, "/");
  const user = await getUser(c);

  if (!user) {
    const returnTo = `/auth/force-reset-password?redirectUrl=${encodeURIComponent(safeRedirectUrl)}`;
    return c.redirect(
      `/auth/login?redirectUrl=${encodeURIComponent(returnTo)}`,
    );
  }

  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
  };
  return c.html(
    <HeadlessLayout title="Force Reset Password">
      <Page>
        <div class="min-h-screen flex items-center justify-center bg-base-200">
          <div class="card w-96 bg-base-100 shadow-none border-none my-4">
            <div class="card-body">
              <div class="text-2xl font-bold text-center mb-4">
                Hi {user.firstName ?? "there"}!
              </div>
              <div class="text-sm text-center mb-4">
                Please reset your password below.
              </div>
              <form
                action="/auth/reset-password"
                method="post"
                {...alpineAttrs}
              >
                <SetPasswordForm
                  buttonText="Reset Password"
                  loadingText="Resetting..."
                  redirectUrl={safeRedirectUrl}
                />
              </form>
            </div>
          </div>
        </div>
      </Page>
    </HeadlessLayout>,
  );
});
