import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../lib/validator.js";
import { forgotPasswordFormSchema } from "../../features/auth/schema.js";
import { sendPasswordResetEmail } from "../../features/auth/services.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import ForgotPasswordForm from "../../features/auth/forms/ForgotPasswordForm.js";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen.js";
import { getUser } from "../../utils.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (user) return c.redirect("/");
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title: "Forgot Password", children: /* @__PURE__ */ jsx("div", { class: "min-h-screen flex items-center justify-center bg-surface px-4", children: /* @__PURE__ */ jsxs("div", { class: "w-96", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4 mb-6", children: [
        /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Account recovery" }),
        /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium text-on-surface-strong", children: "Forgot password" }),
        /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface mt-2", children: "Enter your email and we'll send you a link to reset your password." })
      ] }),
      /* @__PURE__ */ jsx(ForgotPasswordForm, {})
    ] }) }) })
  );
});
const POST = createRoute(
  formValidator(forgotPasswordFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const email = formData.email.trim().toLowerCase();
    const [sendError] = await sendPasswordResetEmail(email);
    if (sendError) {
      return showErrorAlert(
        c,
        "Something went wrong. Please try again later.",
        500
      );
    }
    return c.html(
      /* @__PURE__ */ jsx(
        FormSuccessScreen,
        {
          id: "forgot-password-form",
          message: "If an account exists for that email, we've sent a password reset link. Check your inbox and spam folder."
        }
      )
    );
  }
);
export {
  GET,
  POST
};
