import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import { capitalize } from "../../../../../utils.js";
const statusVariant = {
  draft: "warning",
  approved: "info",
  scheduled: "accent",
  sent: "success",
  failed: "danger"
};
const NewsletterStatusPill = ({ status }) => /* @__PURE__ */ jsx(Pill, { variant: statusVariant[status] ?? "default", children: capitalize(status) });
var NewsletterStatusPill_default = NewsletterStatusPill;
export {
  NewsletterStatusPill_default as default
};
