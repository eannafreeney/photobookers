import { jsx } from "react/jsx-runtime";
import { Section, Row, Column, Button } from "@react-email/components";
import { brand, resolveAppBaseUrl } from "../constants.js";
const NewsletterCtaButton = ({
  ctaText,
  href
}) => /* @__PURE__ */ jsx(Section, { className: "my-12 ", children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsx(Column, { align: "center", children: /* @__PURE__ */ jsx(
  Button,
  {
    href: href || resolveAppBaseUrl(),
    style: { backgroundColor: brand.primary, color: brand.onPrimary },
    className: "text-xs font-semibold tracking-[0.16em] uppercase rounded px-6 py-4 text-center",
    children: ctaText
  }
) }) }) });
export {
  NewsletterCtaButton
};
