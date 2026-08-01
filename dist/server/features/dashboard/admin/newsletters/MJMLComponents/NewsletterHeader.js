import { jsx, jsxs } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlImage, MjmlDivider } from "mjml-react";
import {
  appBaseUrl,
  brand,
  newsletterAssets,
  newsletterLogoWidthPx
} from "../constants.js";
const NewsletterHeader = () => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "24px 25px 0", children: /* @__PURE__ */ jsxs(MjmlColumn, { children: [
  /* @__PURE__ */ jsx(
    MjmlImage,
    {
      src: newsletterAssets.logo,
      alt: "Photobookers",
      href: appBaseUrl,
      width: `${newsletterLogoWidthPx}px`,
      align: "center",
      padding: "0 0 20px"
    }
  ),
  /* @__PURE__ */ jsx(
    MjmlDivider,
    {
      borderWidth: "2px",
      borderColor: brand.outlineStrong,
      padding: "0"
    }
  )
] }) });
export {
  NewsletterHeader
};
