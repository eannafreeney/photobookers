import { jsx } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlText } from "mjml-react";
import { brand } from "../constants.js";
const NewsletterIntro = ({ introText }) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlText,
  {
    align: "center",
    fontSize: "15px",
    lineHeight: "1.65",
    color: brand.onSurface,
    padding: "0 25px 24px",
    children: introText
  }
) }) });
export {
  NewsletterIntro
};
