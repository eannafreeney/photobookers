import { jsx } from "react/jsx-runtime";
import { Section, Row, Column, Text } from "@react-email/components";
import { brand } from "../constants.js";
const NewsletterOutro = ({ outroText }) => /* @__PURE__ */ jsx(Section, { style: { backgroundColor: brand.surface }, children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsx(Column, { children: /* @__PURE__ */ jsx(
  Text,
  {
    style: { color: brand.onSurface },
    className: "m-0 text-center text-sm leading-[1.65] px-[25px]",
    children: outroText
  }
) }) }) });
export {
  NewsletterOutro
};
