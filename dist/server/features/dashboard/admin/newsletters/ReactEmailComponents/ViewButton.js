import { jsx } from "react/jsx-runtime";
import { Button } from "@react-email/components";
const ViewButton = ({ href }) => /* @__PURE__ */ jsx(
  Button,
  {
    href,
    style: {
      display: "block",
      width: "50%",
      maxWidth: "100%",
      boxSizing: "border-box",
      margin: "12px auto 0",
      padding: "12px 0"
    },
    className: "bg-white text-black border-outlineStrong border text-xs font-semibold uppercase rounded px-3 py-2 text-center mx-auto",
    children: "View"
  }
);
export {
  ViewButton
};
