import { toUtcStartOfDay } from "../../lib/utils.js";
const VERIFICATION_FEEDBACK_DELAY_DAYS = 7;
function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function getVerificationFeedbackEligibleBefore(runDate = /* @__PURE__ */ new Date()) {
  return addUtcDays(
    toUtcStartOfDay(runDate),
    -VERIFICATION_FEEDBACK_DELAY_DAYS
  );
}
export {
  VERIFICATION_FEEDBACK_DELAY_DAYS,
  getVerificationFeedbackEligibleBefore
};
