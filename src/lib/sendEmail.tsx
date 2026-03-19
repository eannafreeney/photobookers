import { err, ok } from "./Result";
import { supabaseAdmin } from "./supabase";

const adminEmail = process.env.ADMIN_EMAIL ?? "hello@photobookers.com";

export async function sendAdminEmail(subject: string, html: string) {
  return sendEmail(adminEmail, subject, html);
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
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
    return ok(undefined);
  } catch (e) {
    return err({ reason: "Failed to send email", cause: e });
  }
}
