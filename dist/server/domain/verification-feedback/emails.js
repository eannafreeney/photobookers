import { escapeHtml } from "../../features/dashboard/admin/planner/shareKit.js";
function buildFeedbackRequestEmail(params) {
  const name = escapeHtml(params.name);
  const intro = params.kind === "creator" ? "Your creator profile has been verified on Photobookers for about a week now \u2014 I wanted to check in, see how you are doing, and thank you for taking the chance with Photobookers and helping us grow." : "You joined Photobookers about a week ago \u2014 I wanted to check in, see how you are doing, and thank you for taking the chance with Photobookers and helping us grow.";
  return `
  <p>Hi ${name},</p>
  <p>${intro}</p>
  <p>I'm building this for people who care about photobooks, and your feedback would really help us improve.</p>
  <p>A few prompts if useful:</p>
  <ul>
    <li>Is there a feature you expected that isn't there yet?</li>
    <li>Anything we could do better?</li>
  </ul>
  <p>Reply to this email with whatever comes to mind \u2014 a single sentence is fine. I read every email personally and reply to every one.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}
export {
  buildFeedbackRequestEmail
};
