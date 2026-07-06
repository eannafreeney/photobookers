import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { redirectUrlSchema } from "../../schemas/index.js";
import { formValidator, paramValidator } from "../../lib/validator.js";
import { loginFormSchema } from "../../features/auth/schema.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import LoginForm from "../../features/auth/forms/LoginForm.js";
import { getFlash, getUser } from "../../utils.js";
import {
  getMustResetPasswordState,
  loginAndSetCookies
} from "../../features/auth/services.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import { safeAppRedirect } from "../../lib/safeAppRedirect.js";
const GET = createRoute(async (c) => {
  const redirectUrl = c.req.query("redirectUrl") ?? null;
  const user = await getUser(c);
  const flash = await getFlash(c);
  if (user) return c.redirect(safeAppRedirect(redirectUrl, "/"));
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title: "Sign In", flash, children: /* @__PURE__ */ jsx("div", { class: "min-h-screen flex items-center justify-center bg-surface px-4", children: /* @__PURE__ */ jsxs("div", { class: "w-96", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4 mb-6", children: [
        /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Welcome Back" }),
        /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium text-on-surface-strong", children: "Sign In" })
      ] }),
      /* @__PURE__ */ jsx(LoginForm, { redirectUrl })
    ] }) }) })
  );
});
const POST = createRoute(
  paramValidator(redirectUrlSchema),
  formValidator(loginFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const redirectUrl = c.req.valid("param").redirectUrl;
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const [loginErr, login] = await loginAndSetCookies(c, email, password);
    const afterLoginUrl = safeAppRedirect(redirectUrl, "/");
    if (loginErr) return showErrorAlert(c, "Invalid email or password", 401);
    const [wasForcedResetPasswordError, wasForcedResetPassword] = await getMustResetPasswordState(login.userId);
    if (wasForcedResetPasswordError)
      return showErrorAlert(c, wasForcedResetPasswordError.reason);
    if (wasForcedResetPassword) {
      return c.redirect(
        `/auth/force-reset-password?redirectUrl=${encodeURIComponent(afterLoginUrl)}`
      );
    }
    return c.redirect(afterLoginUrl);
  }
);
export {
  GET,
  POST
};
