import { jsx, jsxs } from "react/jsx-runtime";
import { Section, Row, Column, Text } from "@react-email/components";
import { brand } from "../constants.js";
const NewsletterSubject = ({
  subject,
  weekLabel
}) => /* @__PURE__ */ jsx(Section, { className: "p-0", children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsxs(Column, { align: "center", className: "p-0", children: [
  /* @__PURE__ */ jsx(
    Text,
    {
      style: { color: brand.accent },
      className: "mt-0 mb-0 px-[25px] pt-4 pb-2 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]",
      children: "Photobookers Weekly"
    }
  ),
  weekLabel ? /* @__PURE__ */ jsx(
    Text,
    {
      style: { color: brand.onSurfaceWeak },
      className: "mt-0 mb-0 px-[25px] pt-0 pb-3 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]",
      children: weekLabel
    }
  ) : null,
  /* @__PURE__ */ jsx(
    Text,
    {
      style: {
        color: brand.onSurfaceStrong,
        fontFamily: brand.fontDisplay
      },
      className: "mt-0 mb-0 px-[25px] pt-0 pb-6 text-center text-[32px] font-medium leading-[1.1]",
      children: subject
    }
  )
] }) }) });
export {
  NewsletterSubject
};
