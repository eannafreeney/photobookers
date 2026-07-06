import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View
} from "../../../lib/hxml-comps.js";
const NEWSLETTER_FORM_FIELDS_ID = "newsletter-form-fields";
const HyperviewNewsletterFormFields = ({
  baseUrl,
  email = "",
  submitLabel = "Sign up",
  showSubmitBehavior = true
}) => /* @__PURE__ */ jsxs(
  View,
  {
    id: NEWSLETTER_FORM_FIELDS_ID,
    xmlns: "https://hyperview.org/hyperview",
    style: "newsletter-form-row",
    children: [
      /* @__PURE__ */ jsx(
        TextField,
        {
          style: "newsletter-input",
          name: "email",
          placeholder: "you@example.com",
          "keyboard-type": "email-address",
          value: email
        }
      ),
      /* @__PURE__ */ jsxs(View, { style: "newsletter-btn", id: "newsletter-submit", children: [
        /* @__PURE__ */ jsx(Text, { style: "newsletter-btn-label", children: submitLabel }),
        showSubmitBehavior ? /* @__PURE__ */ jsx(
          Behavior,
          {
            action: "replace",
            verb: "post",
            href: `${baseUrl}/newsletter`,
            target: NEWSLETTER_FORM_FIELDS_ID
          }
        ) : null
      ] })
    ]
  }
);
const NewsletterCard = ({ baseUrl = "" }) => /* @__PURE__ */ jsxs(View, { style: "newsletter-card", children: [
  /* @__PURE__ */ jsxs(View, { style: "newsletter-header", children: [
    /* @__PURE__ */ jsx(View, { style: "newsletter-icon-wrap", children: /* @__PURE__ */ jsx(Text, { style: "newsletter-icon", children: "\u2709" }) }),
    /* @__PURE__ */ jsxs(View, { style: "newsletter-copy", children: [
      /* @__PURE__ */ jsx(Text, { style: "newsletter-heading", children: "Join the mailing list" }),
      /* @__PURE__ */ jsx(Text, { style: "newsletter-subheading", children: "Discover new books and creators." })
    ] })
  ] }),
  /* @__PURE__ */ jsx(Form, { id: "newsletter-form", children: /* @__PURE__ */ jsx(HyperviewNewsletterFormFields, { baseUrl }) })
] });
var NewsletterCard_default = NewsletterCard;
const newsletterCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-card",
      backgroundColor: "#f2efe8",
      borderTopWidth: 2,
      borderBottomWidth: 2,
      borderColor: "#191613",
      padding: 16,
      gap: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-header",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-icon-wrap",
      width: 40,
      height: 40,
      backgroundColor: "#fbfaf7",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#e4e0d5",
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-icon",
      fontSize: 18,
      color: "#a22c29",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "newsletter-copy", flex: 1, gap: 4 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-heading",
      fontFamily: "Fraunces-Medium",
      fontSize: 17,
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-subheading",
      fontSize: 13,
      color: "#45413a",
      lineHeight: 18
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-form-row",
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-input",
      flex: 1,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      borderRadius: 0,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 12,
      paddingRight: 12,
      fontSize: 14,
      backgroundColor: "#fbfaf7",
      minHeight: 40
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-btn",
      backgroundColor: "#a22c29",
      borderRadius: 0,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 16,
      paddingRight: 16,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "newsletter-btn-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 14
    }
  )
] });
export {
  HyperviewNewsletterFormFields,
  NEWSLETTER_FORM_FIELDS_ID,
  NewsletterCard_default as default,
  newsletterCardStyles
};
