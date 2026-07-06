import { jsx } from "hono/jsx/jsx-runtime";
import Badge from "./Badge.js";
const AvailabilityBadge = ({ availabilityStatus = "available" }) => {
  let text;
  let variant;
  switch (availabilityStatus) {
    case "available":
      text = "Available";
      variant = "success";
      break;
    case "sold_out":
      text = "Sold Out";
      variant = "danger";
      break;
    case "unavailable":
      text = "Unavailable";
      variant = "warning";
      break;
  }
  return /* @__PURE__ */ jsx(Badge, { variant, children: text });
};
var AvailabilityBadge_default = AvailabilityBadge;
export {
  AvailabilityBadge_default as default
};
