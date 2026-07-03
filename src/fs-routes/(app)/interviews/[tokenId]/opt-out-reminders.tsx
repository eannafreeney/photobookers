import { Context } from "hono";
import { createRoute } from "hono-fsr";
import InfoPage from "../../../../pages/InfoPage";
import { setInterviewReminderOptOutByToken } from "../../../../domain/interviews/optOut";
import { routeParam } from "../../../../lib/routeParam";

export const GET = createRoute(async (c: Context) => {
  const tokenId = routeParam(c, "tokenId");
  const [error, result] = await setInterviewReminderOptOutByToken(tokenId);

  if (error) {
    return c.html(<InfoPage errorMessage="Invalid interview link" />);
  }

  const message = result.alreadyOptedOut
    ? "You are already opted out of interview reminders."
    : "You will no longer receive interview reminders from Photobookers. You can still complete the interview using your original link if you change your mind.";

  return c.html(<InfoPage isSuccess errorMessage={message} />);
});
