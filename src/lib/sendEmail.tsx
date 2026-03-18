import { supabaseAdmin } from "./supabase";

const adminEmail = process.env.ADMIN_EMAIL ?? "hello@photobookers.com";

export async function sendAdminEmail(subject: string, html: string) {
  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: adminEmail,
        subject,
        html,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });
    if (error) console.error("Failed to send claim notification email:", error);
  } catch (e) {
    console.error("Claim notification email error:", e);
  }
}
