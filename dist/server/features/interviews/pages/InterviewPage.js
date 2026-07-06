import { jsx } from "hono/jsx/jsx-runtime";
import InfoPage from "../../../pages/InfoPage.js";
import { getInterviewByToken } from "../../dashboard/admin/creators/services.js";
import { getCreatorById } from "../../dashboard/creators/services.js";
import IntervewForm from "../forms/IntervewForm.js";
const InterviewPage = async ({ inviteToken }) => {
  const [err, interview] = await getInterviewByToken(inviteToken);
  if (err || !interview)
    return /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Invalid interview link" });
  if (interview.status === "completed") {
    return /* @__PURE__ */ jsx(InfoPage, { isSuccess: true, errorMessage: "Interview already completed." });
  }
  if (interview.status === "expired") {
    return /* @__PURE__ */ jsx(InfoPage, { errorMessage: "This interview link has expired." });
  }
  if (interview.status !== "sent") {
    return /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Invalid interview link" });
  }
  const [creatorErr, creator] = await getCreatorById(interview?.creatorId);
  if (creatorErr || !creator)
    return /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found" });
  return /* @__PURE__ */ jsx(IntervewForm, { inviteToken, creator });
};
var InterviewPage_default = InterviewPage;
export {
  InterviewPage_default as default
};
