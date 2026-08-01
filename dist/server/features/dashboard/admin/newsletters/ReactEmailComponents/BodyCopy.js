import { jsx } from "react/jsx-runtime";
import { Text } from "@react-email/components";
import { brand } from "../constants.js";
const BodyCopy = ({ children }) => /* @__PURE__ */ jsx(
  Text,
  {
    style: { color: brand.onSurface, textAlign: "center" },
    className: "mt-0 mb-3 text-md leading-[1.6] text-center",
    children
  }
);
export {
  BodyCopy
};
