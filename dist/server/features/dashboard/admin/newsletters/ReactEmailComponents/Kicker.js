import { jsx } from "react/jsx-runtime";
import { Text } from "@react-email/components";
import { brand } from "../constants.js";
const Kicker = ({ children }) => /* @__PURE__ */ jsx(
  Text,
  {
    style: { color: brand.accent },
    className: "m-0 mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] leading-[1.2]",
    children
  }
);
export {
  Kicker
};
