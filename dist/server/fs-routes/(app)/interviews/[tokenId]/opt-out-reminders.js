import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import InfoPage from "../../../../pages/InfoPage.js";
import { setInterviewReminderOptOutByToken } from "../../../../domain/interviews/optOut.js";
import { routeParam } from "../../../../lib/routeParam.js";
const GET = createRoute(async (c) => {
  const tokenId = routeParam(c, "tokenId");
  const [error, result] = await setInterviewReminderOptOutByToken(tokenId);
  if (error) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Invalid interview link" }));
  }
  const message = result.alreadyOptedOut ? "You are already opted out of interview reminders." : "You will no longer receive interview reminders from Photobookers. You can still complete the interview using your original link if you change your mind.";
  return c.html(/* @__PURE__ */ jsx(InfoPage, { isSuccess: true, errorMessage: message }));
});
export {
  GET
};
