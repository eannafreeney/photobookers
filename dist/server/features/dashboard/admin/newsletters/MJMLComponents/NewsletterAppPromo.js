import { jsx } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlButton } from "mjml-react";
import { appStoreUrl, brand } from "../constants.js";
const NewsletterAppPromo = () => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0 25px 24px", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlButton,
  {
    href: appStoreUrl,
    backgroundColor: brand.primary,
    color: brand.onPrimary,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    borderRadius: "4px",
    innerPadding: "14px 28px",
    align: "center",
    children: "Download iOS App"
  }
) }) });
export {
  NewsletterAppPromo
};
