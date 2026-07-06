import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const SignInPromptBody = ({
  hint,
  baseUrl,
  loginHref,
  accountsHref,
  title = "Sign in",
  buttonLabel = "Log in",
  createAccountLabel = "Create account"
}) => /* @__PURE__ */ jsx(View, { style: "sign-in-prompt", children: /* @__PURE__ */ jsxs(View, { style: "sign-in-prompt-card", children: [
  /* @__PURE__ */ jsx(Text, { style: "sign-in-prompt-title", children: title }),
  /* @__PURE__ */ jsx(Text, { style: "sign-in-prompt-subtitle", children: hint }),
  /* @__PURE__ */ jsxs(View, { style: "sign-in-prompt-primary-btn", children: [
    /* @__PURE__ */ jsx(Behavior, { href: loginHref ?? `${baseUrl}/hyperview/login` }),
    /* @__PURE__ */ jsx(Text, { style: "sign-in-prompt-primary-label", children: buttonLabel })
  ] }),
  /* @__PURE__ */ jsxs(View, { style: "sign-in-prompt-secondary-btn", children: [
    /* @__PURE__ */ jsx(Behavior, { href: accountsHref ?? `${baseUrl}/hyperview/accounts` }),
    /* @__PURE__ */ jsx(Text, { style: "sign-in-prompt-secondary-label", children: createAccountLabel })
  ] })
] }) });
const SignInPrompt = ({
  hint,
  baseUrl,
  loginHref,
  accountsHref,
  title,
  buttonLabel,
  createAccountLabel,
  variant = "inline"
}) => {
  const body = /* @__PURE__ */ jsx(
    SignInPromptBody,
    {
      hint,
      baseUrl,
      loginHref,
      accountsHref,
      title,
      buttonLabel,
      createAccountLabel
    }
  );
  if (variant === "fragment") {
    return /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: body });
  }
  return body;
};
var SignInPrompt_default = SignInPrompt;
const signInPromptStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "sign-in-prompt", flexDirection: "column" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-card",
      backgroundColor: "#fbfaf7",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      padding: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 22,
      color: "#191613",
      marginBottom: 10
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-subtitle",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 28
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-primary-btn",
      backgroundColor: "#191613",
      borderRadius: 0,
      paddingTop: 16,
      paddingBottom: 16,
      alignItems: "center",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-primary-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-secondary-btn",
      borderWidth: 1,
      borderColor: "#a39d90",
      borderRadius: 0,
      paddingTop: 16,
      paddingBottom: 16,
      alignItems: "center",
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "sign-in-prompt-secondary-label",
      color: "#191613",
      fontWeight: "600",
      fontSize: 16
    }
  )
] });
export {
  SignInPrompt_default as default,
  signInPromptStyles
};
