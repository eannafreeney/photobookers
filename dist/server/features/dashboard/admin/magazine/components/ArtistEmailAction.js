import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
const formatSent = (value) => {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};
const ArtistEmailAction = ({
  action,
  bookId,
  artistEmailSentAt
}) => {
  if (artistEmailSentAt) {
    return /* @__PURE__ */ jsxs("p", { class: "mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#4f7a4a]", children: [
      "\u2713 Emailed ",
      formatSent(artistEmailSentAt)
    ] });
  }
  const previewHref = `${action}/email-artist?bookId=${encodeURIComponent(bookId)}`;
  return /* @__PURE__ */ jsx(Link, { href: previewHref, xTarget: "modal-root", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "auto", children: "Email artist\u2026" }) });
};
var ArtistEmailAction_default = ArtistEmailAction;
export {
  ArtistEmailAction_default as default
};
