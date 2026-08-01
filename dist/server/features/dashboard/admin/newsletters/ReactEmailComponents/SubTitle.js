import { jsx } from "react/jsx-runtime";
import { Text } from "@react-email/components";
import { brand } from "../constants.js";
const SubTitle = ({ children }) => /* @__PURE__ */ jsx(
  Text,
  {
    style: { color: brand.onSurface, textAlign: "center" },
    className: "m-0 text-md leading-normal text-center",
    children
  }
);
export {
  SubTitle
};
