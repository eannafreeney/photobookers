import { jsx, jsxs } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlText } from "mjml-react";
import { brand } from "../constants.js";
import { kickerTextProps } from "./kickerTextProps.js";
const NewsletterSubject = ({
  subject,
  weekLabel
}) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0", children: /* @__PURE__ */ jsxs(MjmlColumn, { padding: "0", children: [
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      ...kickerTextProps,
      color: brand.accent,
      padding: "20px 25px 8px",
      children: "Photobookers Weekly"
    }
  ),
  weekLabel ? /* @__PURE__ */ jsx(
    MjmlText,
    {
      ...kickerTextProps,
      color: brand.onSurfaceWeak,
      padding: "0 25px 12px",
      children: weekLabel
    }
  ) : null,
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      align: "center",
      fontSize: "32px",
      fontWeight: 500,
      lineHeight: "1.15",
      color: brand.onSurfaceStrong,
      padding: "0 25px 20px",
      fontFamily: brand.fontDisplay,
      children: subject
    }
  )
] }) });
export {
  NewsletterSubject
};
