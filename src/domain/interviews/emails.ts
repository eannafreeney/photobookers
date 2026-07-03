export function buildInterviewOpenReminderEmail(params: {
  creatorName: string;
  interviewLink: string;
  profileUrl: string;
  optOutUrl: string;
}) {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>Just a friendly reminder — your Photobookers interview is still open whenever you have a few minutes.</p>
    <p>It should take no more than 10 minutes to complete, and your answers could be published on our main page and promoted on our social media channels.</p>
    <p><a href="${params.interviewLink}">Complete the interview</a></p>
    <p>You can also view your profile here:<br/>
      <a href="${params.profileUrl}">View Profile</a>
    </p>
    <p>Please do not hesitate to reply to this email if you have any questions.</p>
    <p style="color:#666;font-size:14px;margin-top:2rem;">
      <a href="${params.optOutUrl}">Opt out of interview reminders</a>
    </p>
    <p>All the best,<br/>Eanna<br/>Photobookers</p>
  `;
}

export function interviewOpenReminderSubject(creatorName: string) {
  return `Reminder: your Photobookers interview — ${creatorName}`;
}
