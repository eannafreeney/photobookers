import { jsx, jsxs } from "react/jsx-runtime";
import { Section, Row, Column, Text, Hr } from "@react-email/components";
import { brand } from "../constants.js";
import { Kicker } from "./Kicker.js";
const SectionHeading = ({
  kicker,
  children
}) => /* @__PURE__ */ jsx(Section, { style: { margin: "24px 0" }, children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsxs(Column, { children: [
  kicker && /* @__PURE__ */ jsx(Kicker, { children: kicker }),
  /* @__PURE__ */ jsx(
    Text,
    {
      className: "m-0 text-2xl font-medium leading-[1.15] text-center",
      style: { color: brand.onSurfaceStrong },
      children
    }
  ),
  /* @__PURE__ */ jsx(
    Hr,
    {
      className: "mt-3 mb-0 border-t-2 border-black",
      style: { borderColor: brand.outlineStrong }
    }
  )
] }) }) });
export {
  SectionHeading
};
