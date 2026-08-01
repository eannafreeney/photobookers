import { jsx } from "react/jsx-runtime";
import { Text } from "@react-email/components";
import { brand } from "../constants.js";
const Title = ({ children }) => /* @__PURE__ */ jsx(
  Text,
  {
    style: {
      color: brand.onSurfaceStrong,
      fontFamily: brand.fontDisplay,
      textAlign: "center"
    },
    className: "m-0 mb-2 text-3xl leading-[1.2] font-medium text-center",
    children
  }
);
export {
  Title
};
