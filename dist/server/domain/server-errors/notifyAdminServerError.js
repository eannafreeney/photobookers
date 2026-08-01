import { createAdminNotification } from "../notifications/services.js";
import { sendAdminEmail } from "../../lib/sendEmail.js";
const NOTIFY_COOLDOWN_MS = 15 * 60 * 1e3;
let errorCountSinceLastNotify = 0;
let lastSample = null;
let lastNotifiedAt = 0;
function recordServerErrorForAdmin(input) {
  errorCountSinceLastNotify += 1;
  lastSample = input;
}
function resetServerErrorNotifyState() {
  errorCountSinceLastNotify = 0;
  lastSample = null;
  lastNotifiedAt = 0;
}
async function notifyAdminServerErrorIfDue(now = Date.now()) {
  if (errorCountSinceLastNotify === 0 || !lastSample) return;
  if (lastNotifiedAt !== 0 && now - lastNotifiedAt < NOTIFY_COOLDOWN_MS) return;
  const count = errorCountSinceLastNotify;
  const sample = lastSample;
  errorCountSinceLastNotify = 0;
  lastNotifiedAt = now;
  const body = `${count} server error${count === 1 ? "" : "s"} in the last ${NOTIFY_COOLDOWN_MS / 6e4} minutes. Latest: ${sample.method} ${sample.path} \u2014 ${sample.message}`;
  const [notificationError] = await createAdminNotification({
    type: "server_error",
    title: count === 1 ? "Server error" : `${count} server errors`,
    body,
    targetUrl: "/dashboard/admin",
    isRead: false
  });
  if (notificationError) {
    console.error(
      "notifyAdminServerError notification failed:",
      notificationError.reason,
      notificationError
    );
  }
  const [emailError] = await sendAdminEmail(
    `[Photobookers] ${count === 1 ? "Server error" : `${count} server errors`}`,
    `<p>${body}</p><p><a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/admin">Open admin dashboard</a></p>`
  );
  if (emailError) {
    console.error(
      "notifyAdminServerError email failed:",
      emailError.reason,
      emailError
    );
  }
}
async function recordAndNotifyAdminServerError(input) {
  recordServerErrorForAdmin(input);
  await notifyAdminServerErrorIfDue();
}
export {
  notifyAdminServerErrorIfDue,
  recordAndNotifyAdminServerError,
  recordServerErrorForAdmin,
  resetServerErrorNotifyState
};
