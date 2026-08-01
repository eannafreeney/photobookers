import { jsx, jsxs } from "react/jsx-runtime";
import { MjmlSection, MjmlColumn, MjmlText, MjmlDivider } from "mjml-react";
import { brand } from "../constants.js";
import { kickerTextProps } from "./kickerTextProps.js";
const SectionHeading = ({
  kicker,
  children
}) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "28px 25px 12px", children: /* @__PURE__ */ jsxs(MjmlColumn, { children: [
  kicker ? /* @__PURE__ */ jsx(MjmlText, { ...kickerTextProps, color: brand.accent, padding: "0 0 6px", children: kicker }) : null,
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      align: "center",
      fontSize: "24px",
      fontWeight: 500,
      lineHeight: "1.2",
      color: brand.onSurfaceStrong,
      padding: "0 0 12px",
      fontFamily: brand.fontDisplay,
      children
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
  SectionHeading
};
