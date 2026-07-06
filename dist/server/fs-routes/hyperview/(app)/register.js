import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { capitalize, getUser } from "../../../utils.js";
import { parseRegisterType } from "../../../features/auth/schema.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { hyperview } from "../../../lib/hxml.js";
import { xmlText } from "../../../lib/hxml.js";
import { AppLayout } from "../+layout.js";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (user) return c.redirect(`${baseUrl}/hyperview/featured`);
  const registerType = parseRegisterType(c.req.query("type"));
  const redirectUrl = (c.req.query("redirectUrl") ?? "").trim().slice(0, 2e3);
  const isCreator = registerType === "artist" || registerType === "publisher";
  const params = new URLSearchParams();
  params.set("type", registerType);
  if (redirectUrl) params.set("redirectUrl", redirectUrl);
  const webRegisterUrl = `${baseUrl}/auth/register?${params.toString()}`;
  const headline = registerType === "fan" ? "Create account" : `Create ${capitalize(registerType)} account`;
  const intro = isCreator ? "You will finish creating your artist or publisher account in the browser. That step includes email verification and a short security check." : "You will finish creating your fan account in the browser. That step includes email verification and a short security check.";
  const bullets = isCreator ? [
    "Display name",
    "Website (optional)",
    "Email and password",
    "Terms acceptance",
    "Security verification"
  ] : [
    "First and last name",
    "Email and password",
    "Terms acceptance",
    "Security verification"
  ];
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsx(AppLayout, { title: "Create account", showBackButton: true, extraStyles: pageStyles(), children: /* @__PURE__ */ jsxs(View, { style: "register-page", children: [
      /* @__PURE__ */ jsx(Text, { style: "register-headline", children: xmlText(headline) }),
      /* @__PURE__ */ jsx(Text, { style: "register-intro", children: xmlText(intro) }),
      bullets.map((line) => /* @__PURE__ */ jsx(Text, { style: "register-bullet", children: xmlText(`\u2022 ${line}`) }, line)),
      /* @__PURE__ */ jsxs(View, { style: "register-primary-wrap", children: [
        /* @__PURE__ */ jsx(Text, { style: "register-primary-label", children: "Continue in browser" }),
        /* @__PURE__ */ jsx(Behavior, { action: "deep-link", href: webRegisterUrl })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: "register-secondary-wrap", children: [
        /* @__PURE__ */ jsx(Text, { style: "register-secondary-label", children: "Already have an account?" }),
        /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/login` })
      ] })
    ] }) })
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-page",
      marginLeft: 16,
      marginRight: 16,
      paddingTop: 16,
      paddingBottom: 32,
      flexDirection: "column"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-headline",
      fontSize: 22,
      fontWeight: "700",
      color: "#191613",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-intro",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-bullet",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 6
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-primary-wrap",
      marginTop: 24,
      backgroundColor: "#191613",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-primary-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-secondary-wrap",
      marginTop: 20,
      borderWidth: 1,
      borderColor: "#a39d90",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      alignItems: "center",
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "register-secondary-label",
      color: "#191613",
      fontWeight: "600",
      fontSize: 16
    }
  )
] });
export {
  GET
};
