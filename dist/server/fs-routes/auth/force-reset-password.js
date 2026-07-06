import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import Page from "../../components/layouts/Page.js";
import SetPasswordForm from "../../features/auth/forms/SetPasswordForm.js";
import { safeAppRedirect } from "../../lib/safeAppRedirect.js";
const GET = createRoute(async (c) => {
  const q = c.req.query("redirectUrl");
  const safeRedirectUrl = safeAppRedirect(q ?? null, "/");
  const user = await getUser(c);
  if (!user) {
    const returnTo = `/auth/force-reset-password?redirectUrl=${encodeURIComponent(safeRedirectUrl)}`;
    return c.redirect(
      `/auth/login?redirectUrl=${encodeURIComponent(returnTo)}`
    );
  }
  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false"
  };
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title: "Force Reset Password", children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx("div", { class: "min-h-screen flex items-center justify-center bg-surface-alt", children: /* @__PURE__ */ jsxs("div", { class: "w-96 my-4 p-6 bg-surface", children: [
      /* @__PURE__ */ jsxs("div", { class: "text-2xl font-bold text-center mb-4", children: [
        "Hi ",
        user.firstName ?? "there",
        "!"
      ] }),
      /* @__PURE__ */ jsx("div", { class: "text-sm text-center mb-4", children: "Please reset your password below." }),
      /* @__PURE__ */ jsx(
        "form",
        {
          action: "/auth/reset-password",
          method: "post",
          ...alpineAttrs,
          children: /* @__PURE__ */ jsx(
            SetPasswordForm,
            {
              buttonText: "Reset Password",
              loadingText: "Resetting...",
              redirectUrl: safeRedirectUrl
            }
          )
        }
      )
    ] }) }) }) })
  );
});
export {
  GET
};
