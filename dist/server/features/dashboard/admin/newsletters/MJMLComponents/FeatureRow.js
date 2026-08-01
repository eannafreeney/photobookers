import { jsx } from "react/jsx-runtime";
import { MjmlSection } from "mjml-react";
import { brand } from "../constants.js";
const FeatureRow = ({ children }) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0 25px 24px", children });
export {
  FeatureRow
};
