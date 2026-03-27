import { err, ok } from "./result";
import { supabaseAdmin } from "./supabase";

const adminEmail = process.env.ADMIN_EMAIL ?? "hello@photobookers.com";

export async function sendAdminEmail(subject: string, html: string) {
  return sendEmail(adminEmail, subject, html);
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to,
        subject,
        html,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });
    if (error) {
      return err({ reason: "Failed to send email", cause: error });
    }

    // Guard against false positives where the function invocation returns no
    // transport error but did not acknowledge email delivery acceptance.
    const acknowledged =
      (typeof data === "object" &&
        data !== null &&
        ("ok" in data ? (data as { ok?: boolean }).ok === true : false)) ||
      (typeof data === "object" &&
        data !== null &&
        ("success" in data
          ? (data as { success?: boolean }).success === true
          : false)) ||
      (typeof data === "object" &&
        data !== null &&
        typeof (data as { id?: unknown }).id === "string");

    if (!acknowledged) {
      console.error(
        "Email function did not return success acknowledgement",
        data,
      );
      return err({
        reason: "Email function did not return success acknowledgement",
        cause: data,
      });
    }
    console.log("Email sent successfully");
    return ok(undefined);
  } catch (e) {
    console.error("Failed to send email", e);
    return err({ reason: "Failed to send email", cause: e });
  }
}
