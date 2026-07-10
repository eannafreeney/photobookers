import { escapeHtml } from "../../features/dashboard/admin/planner/shareKit";
import { creatorProfileUrl, creatorVerifiedSharePost } from "../../lib/share";

export type CreatorProfileShareEmailParams = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
};

export function creatorProfileShareEmailSubject(): string {
  return "Share your Photobookers profile";
}

export function buildCreatorProfileShareEmail(
  params: CreatorProfileShareEmailParams,
): string {
  const name = escapeHtml(params.displayName);
  const profileUrl = creatorProfileUrl(params.slug);
  const caption = creatorVerifiedSharePost({
    displayName: params.displayName,
    slug: params.slug,
    type: params.type,
  });

  return `
  <p>Hi ${name},</p>
  <p>Thanks again for being a part of Photobookers. We are trying to grow the community and help you and your books get more exposure. If you have a moment, it would mean a lot if you shared a screenshot of your creator page on Instagram. We would love to see it and share it with our followers.</p>
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
  <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111;">Share kit</p>
  <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#444;">Your creator page:<br/><a href="${escapeHtml(profileUrl)}">${escapeHtml(profileUrl)}</a></p>
  <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">Caption to copy:</p>
  <pre style="margin:0 0 16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:13px;line-height:1.5;white-space:pre-wrap;color:#111;">${escapeHtml(caption)}</pre>
  <p>Best regards,<br/>Eanna</p>
`;
}
