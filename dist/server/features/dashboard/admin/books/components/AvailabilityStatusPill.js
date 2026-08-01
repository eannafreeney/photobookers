import { jsx } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import { capitalize } from "../../../../../utils.js";
const AvailabilityStatusPill = ({
  availabilityStatus = "available"
}) => {
  if (!availabilityStatus) return null;
  return /* @__PURE__ */ jsx(
    Pill,
    {
      variant: availabilityStatus === "available" ? "success" : availabilityStatus === "sold_out" ? "danger" : "warning",
      children: availabilityStatus === "sold_out" ? "Sold Out" : capitalize(availabilityStatus)
    }
  );
};
var AvailabilityStatusPill_default = AvailabilityStatusPill;
export {
  AvailabilityStatusPill_default as default
};
