import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { loginFormSchema } from "../../../features/auth/schema.js";
import {
  getMustResetPasswordState,
  loginAndSetCookies
} from "../../../features/auth/services.js";
import { getIsHyperview } from "../../../features/hyperview/lib.js";
import { getUser } from "../../../utils.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { hyperview } from "../../../lib/hxml.js";
import { xmlText } from "../../../lib/hxml.js";
import { AppLayout } from "../+layout.js";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View
} from "../../../lib/hxml-comps.js";
const LOGIN_FORM_PANEL_ID = "login-form-panel";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const featured = `${baseUrl}/hyperview/featured`;
  if (user && !getIsHyperview(c)) {
    return c.redirect(featured);
  }
  return hv(
    /* @__PURE__ */ jsx(AppLayout, { title: "Sign in", showBackButton: true, extraStyles: pageStyles(), children: /* @__PURE__ */ jsx(LoginFormPanel, { baseUrl }) })
  );
});
const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const form = await c.req.parseBody();
  const parsed = loginFormSchema.safeParse(form);
  const isHyperview = getIsHyperview(c);
  if (!parsed.success) {
    return hv(
      /* @__PURE__ */ jsx(
        LoginFormPanel,
        {
          baseUrl,
          error: "Enter a valid email and password (at least 8 characters)."
        }
      ),
      400
    );
  }
  const { email, password } = parsed.data;
  const [loginErr, login] = await loginAndSetCookies(c, email, password);
  if (loginErr || !login) {
    return hv(
      /* @__PURE__ */ jsx(
        LoginFormPanel,
        {
          baseUrl,
          error: "Invalid email or password. Try again."
        }
      ),
      401
    );
  }
  const [mustErr, mustReset] = await getMustResetPasswordState(login.userId);
  if (mustErr) {
    return hv(
      /* @__PURE__ */ jsx(
        LoginFormPanel,
        {
          baseUrl,
          error: "Something went wrong. Try again later."
        }
      ),
      500
    );
  }
  if (mustReset) {
    const resetUrl = `${baseUrl}/auth/force-reset-password?redirectUrl=${encodeURIComponent(`${baseUrl}/hyperview/featured`)}`;
    return hv(
      /* @__PURE__ */ jsxs(
        View,
        {
          id: LOGIN_FORM_PANEL_ID,
          style: "login-page",
          xmlns: "https://hyperview.org/hyperview",
          children: [
            /* @__PURE__ */ jsx(Text, { style: "login-hint", children: "You must set a new password before continuing." }),
            /* @__PURE__ */ jsxs(View, { style: "login-submit-wrap", children: [
              /* @__PURE__ */ jsx(Behavior, { action: "deep-link", href: resetUrl }),
              /* @__PURE__ */ jsx(Text, { style: "login-submit-label", children: "Open reset in browser" })
            ] })
          ]
        }
      )
    );
  }
  if (isHyperview) {
    const featured = `${baseUrl}/hyperview/featured`;
    return hv(
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(
        Behavior,
        {
          trigger: "load",
          action: "set-supabase-session",
          href: featured,
          "access-token": xmlText(login.session.access_token),
          "refresh-token": xmlText(login.session.refresh_token)
        }
      ) })
    );
  }
  return c.redirect(`${baseUrl}/hyperview/featured`);
});
const LoginFormPanel = ({
  baseUrl,
  error
}) => /* @__PURE__ */ jsxs(
  View,
  {
    id: LOGIN_FORM_PANEL_ID,
    style: "login-page",
    xmlns: "https://hyperview.org/hyperview",
    children: [
      error ? /* @__PURE__ */ jsx(Text, { style: "login-error", children: xmlText(error) }) : null,
      /* @__PURE__ */ jsxs(Form, { id: "hv-login-form", children: [
        /* @__PURE__ */ jsx(Text, { style: "login-label", children: "Email" }),
        /* @__PURE__ */ jsx(
          TextField,
          {
            style: "login-field",
            name: "email",
            placeholder: "you@example.com",
            "keyboard-type": "email-address"
          }
        ),
        /* @__PURE__ */ jsx(Text, { style: "login-label", children: "Password" }),
        /* @__PURE__ */ jsx(
          TextField,
          {
            style: "login-field",
            name: "password",
            placeholder: "Password",
            "secure-text": "true",
            "text-content-type": "password"
          }
        ),
        /* @__PURE__ */ jsxs(View, { style: "login-submit-wrap", children: [
          /* @__PURE__ */ jsx(
            Behavior,
            {
              verb: "post",
              action: "replace",
              target: LOGIN_FORM_PANEL_ID,
              href: `${baseUrl}/hyperview/login`
            }
          ),
          /* @__PURE__ */ jsx(Text, { style: "login-submit-label", children: "Sign in" })
        ] })
      ] })
    ]
  }
);
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "login-page",
      marginLeft: 16,
      marginRight: 16,
      paddingTop: 24,
      flexDirection: "column"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "login-label",
      fontSize: 13,
      fontWeight: "600",
      color: "#45413a",
      marginBottom: 6,
      marginTop: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "login-field",
      borderWidth: 1,
      borderColor: "#e4e0d5",
      borderRadius: 0,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 12,
      paddingRight: 12,
      fontSize: 15,
      backgroundColor: "#fbfaf7",
      color: "#191613",
      marginBottom: 4,
      textTransform: "lowercase"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "login-submit-wrap",
      marginTop: 24,
      backgroundColor: "#191613",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      alignItems: "center",
      alignSelf: "stretch"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "login-submit-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "login-error", fontSize: 14, color: "#b91c1c", marginBottom: 12 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "login-hint",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "login-success", fontSize: 16, fontWeight: "600", color: "#191613" })
] });
export {
  GET,
  LOGIN_FORM_PANEL_ID,
  POST
};
