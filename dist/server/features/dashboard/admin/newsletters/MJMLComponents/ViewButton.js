import { jsx } from "react/jsx-runtime";
import { MjmlButton } from "mjml-react";
import { brand } from "../constants.js";
const ViewButton = ({ href }) => /* @__PURE__ */ jsx(
  MjmlButton,
  {
    href,
    backgroundColor: "#ffffff",
    color: brand.onSurfaceStrong,
    border: `1px solid ${brand.outlineStrong}`,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "4px",
    innerPadding: "12px 24px",
    align: "center",
    width: "50%",
    children: "View"
  }
);
export {
  ViewButton
};
