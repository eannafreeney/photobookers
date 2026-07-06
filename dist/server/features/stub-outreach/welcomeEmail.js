import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creatorStubOutreachEmails, creators } from "../../db/schema.js";
import { generateWelcomeEmail } from "../dashboard/admin/creators/emails.js";
import { markWelcomeEmailSentAdmin } from "../dashboard/admin/creators/services.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import { stubClaimStartUrl } from "./urls.js";
import { stubClaimStartUrl as stubClaimStartUrl2 } from "./urls.js";
async function sendStubWelcomeEmail(creator, options = {}) {
  const recipient = options.to?.trim() || creator.email?.trim();
  if (!recipient) {
    return err({ reason: "Creator has no email" });
  }
  const claimLink = stubClaimStartUrl(creator.id);
  const html = generateWelcomeEmail(
    { ...creator, displayName: creator.displayName },
    claimLink
  );
  const subject = `Hi ${creator.displayName}! Invitation to Photobookers`;
  const [emailError] = await sendEmail(recipient, subject, html);
  if (emailError) {
    return err({ reason: emailError.reason });
  }
  const [markError] = await markWelcomeEmailSentAdmin(creator.id);
  if (markError) {
    return err({ reason: markError.reason });
  }
  await db.insert(creatorStubOutreachEmails).values({
    creatorId: creator.id,
    kind: "welcome"
  });
  return ok({ to: recipient });
}
async function logStubOutreachEmail(creatorId, kind) {
  await db.insert(creatorStubOutreachEmails).values({ creatorId, kind });
}
async function setStubOutreachOptOut(creatorId, optedOut) {
  try {
    await db.update(creators).set({ stubOutreachOptOutAt: optedOut ? /* @__PURE__ */ new Date() : null }).where(eq(creators.id, creatorId));
    return ok(void 0);
  } catch (error) {
    console.error("setStubOutreachOptOut", error);
    return err({ reason: "Failed to update outreach opt-out", cause: error });
  }
}
export {
  logStubOutreachEmail,
  sendStubWelcomeEmail,
  setStubOutreachOptOut,
  stubClaimStartUrl2 as stubClaimStartUrl
};
