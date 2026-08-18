import { jsx } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlButton } from "mjml-react";
import { brand, resolveAppBaseUrl } from "../constants.js";
const NewsletterCtaButton = ({
  ctaText,
  href
}) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "24px 25px 8px", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlButton,
  {
    href: href || resolveAppBaseUrl(),
    backgroundColor: brand.primary,
    color: brand.onPrimary,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    borderRadius: "4px",
    innerPadding: "14px 28px",
    align: "center",
    children: ctaText
  }
) }) });
export {
  NewsletterCtaButton
};
