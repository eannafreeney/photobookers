import { jsx, jsxs } from "react/jsx-runtime";
import { Section, Row, Column, Img, Hr } from "@react-email/components";
import { brand, newsletterAssets } from "../constants.js";
const NewsletterHeader = () => /* @__PURE__ */ jsx(Section, { style: { padding: "12px 0 0" }, children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsxs(Column, { align: "center", className: "text-center", children: [
  /* @__PURE__ */ jsx(
    Img,
    {
      src: newsletterAssets.logo,
      alt: "Photobookers",
      height: 32,
      className: "mx-auto mb-4"
    }
  ),
  /* @__PURE__ */ jsx(
    Hr,
    {
      style: { borderColor: brand.outlineStrong, borderWidth: 2 },
      className: "mt-0 mb-0 border-t-2"
    }
  )
] }) }) });
export {
  NewsletterHeader
};
