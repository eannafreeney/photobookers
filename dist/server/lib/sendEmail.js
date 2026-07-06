import { err, ok } from "./result.js";
import { supabaseAdmin } from "./supabase.js";
const adminEmail = process.env.ADMIN_EMAIL ?? "hello@photobookers.com";
async function sendAdminEmail(subject, html) {
  return sendEmail(adminEmail, subject, html);
}
async function sendEmail(to, subject, html) {
  try {
    const { data, error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to,
        subject,
        html
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET
      }
    });
    if (error) {
      console.error("Failed to send email", error);
      return err({ reason: "Failed to send email", cause: error });
    }
    const acknowledged = typeof data === "object" && data !== null && ("ok" in data ? data.ok === true : false) || typeof data === "object" && data !== null && ("success" in data ? data.success === true : false) || typeof data === "object" && data !== null && typeof data.id === "string";
    if (!acknowledged) {
      console.error(
        "Email function did not return success acknowledgement",
        data
      );
      return err({
        reason: "Email function did not return success acknowledgement",
        cause: data
      });
    }
    return ok(void 0);
  } catch (e) {
    console.error("Failed to send email", e);
    return err({ reason: "Failed to send email", cause: e });
  }
}
export {
  sendAdminEmail,
  sendEmail
};
