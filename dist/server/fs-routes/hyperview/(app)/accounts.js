import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { hyperview } from "../../../lib/hxml.js";
import { xmlText } from "../../../lib/hxml.js";
import { accountMobileCards } from "../../../features/auth/accountsContent.js";
import { AppLayout } from "../+layout.js";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (user) return c.redirect(`${baseUrl}/hyperview/featured`);
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsx(AppLayout, { title: "Accounts", showBackButton: true, extraStyles: pageStyles(), children: /* @__PURE__ */ jsxs(View, { style: "accounts-page", children: [
      /* @__PURE__ */ jsx(Text, { style: "accounts-section-title", children: "Accounts" }),
      /* @__PURE__ */ jsx(Text, { style: "accounts-lead", children: "Pick an account type, then sign up in your browser." }),
      accountMobileCards.map((card) => /* @__PURE__ */ jsxs(View, { style: "accounts-card", children: [
        /* @__PURE__ */ jsx(Text, { style: "accounts-type-title", children: xmlText(card.type) }),
        card.features.map((f) => /* @__PURE__ */ jsx(Text, { style: "accounts-feature", children: xmlText(`\u2022 ${f.name}`) }, f.name)),
        /* @__PURE__ */ jsxs(View, { style: "accounts-signup-wrap", children: [
          /* @__PURE__ */ jsx(Text, { style: "accounts-signup-label", children: "Sign up" }),
          /* @__PURE__ */ jsx(
            Behavior,
            {
              href: `${baseUrl}/hyperview/register?type=${card.slug}`
            }
          )
        ] })
      ] }, card.slug))
    ] }) })
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "accounts-page",
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
      id: "accounts-section-title",
      fontSize: 22,
      fontWeight: "700",
      color: "#191613",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "accounts-lead",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 20
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "accounts-card",
      backgroundColor: "#fbfaf7",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      padding: 16,
      marginBottom: 16,
      flexDirection: "column"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "accounts-type-title",
      fontSize: 18,
      fontWeight: "700",
      color: "#191613",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "accounts-feature",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "accounts-signup-wrap",
      marginTop: 16,
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
      id: "accounts-signup-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 16
    }
  )
] });
export {
  GET
};
