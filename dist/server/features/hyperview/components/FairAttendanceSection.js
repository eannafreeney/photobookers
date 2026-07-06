import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, View } from "../../../lib/hxml-comps.js";
import FairAttendButton, {
  fairAttendanceSectionId,
  fairAttendButtonStyles
} from "./FairAttendButton.js";
const FairAttendanceSection = ({
  fair,
  user,
  baseUrl,
  isAttending
}) => /* @__PURE__ */ jsx(View, { id: fairAttendanceSectionId(fair.id), style: "fair-attendance-section", children: /* @__PURE__ */ jsx(
  FairAttendButton,
  {
    fair,
    user,
    baseUrl,
    isAttending
  }
) });
var FairAttendanceSection_default = FairAttendanceSection;
const fairAttendanceSectionStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  fairAttendButtonStyles(),
  /* @__PURE__ */ jsx(Style, { id: "fair-attendance-section", flexDirection: "column", gap: 8 })
] });
export {
  FairAttendanceSection_default as default,
  fairAttendanceSectionStyles
};
