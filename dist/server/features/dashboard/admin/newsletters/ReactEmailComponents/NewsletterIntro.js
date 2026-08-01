import { jsx } from "react/jsx-runtime";
import { Section, Row, Column, Text } from "@react-email/components";
const NewsletterIntro = ({ introText }) => /* @__PURE__ */ jsx(Section, { children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsx(Column, { children: /* @__PURE__ */ jsx(Text, { className: "m-0 pb-6 text-center text-sm leading-[1.65] px-[25px]", children: introText }) }) }) });
export {
  NewsletterIntro
};
