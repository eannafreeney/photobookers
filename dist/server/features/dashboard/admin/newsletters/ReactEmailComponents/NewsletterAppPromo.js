import { jsx } from "react/jsx-runtime";
import { Section, Row, Column, Button } from "@react-email/components";
import { appStoreUrl } from "../constants.js";
const NewsletterAppPromo = () => /* @__PURE__ */ jsx(Section, { style: { padding: "0 0 6px" }, children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsx(Column, { align: "center", children: /* @__PURE__ */ jsx(
  Button,
  {
    href: appStoreUrl,
    style: { margin: "0 auto" },
    className: "bg-black text-white text-xs font-semibold tracking-[0.16em] uppercase rounded px-6 py-4 text-center",
    children: "Download iOS App"
  }
) }) }) });
export {
  NewsletterAppPromo
};
