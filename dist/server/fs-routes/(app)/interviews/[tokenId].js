import { jsx } from "hono/jsx/jsx-runtime";
import {
  completeInterviewByToken,
  getInterviewByToken
} from "../../../domain/interviews/token.js";
import { getCreatorById } from "../../../features/dashboard/creators/services.js";
import IntervewForm from "../../../features/interviews/forms/IntervewForm.js";
import InfoPage from "../../../pages/InfoPage.js";
import { createRoute } from "hono-fsr";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import { interviewFormSchema } from "../../../features/interviews/schema.js";
import { formValidator, validateImageFile } from "../../../lib/validator.js";
import FormSuccessScreen from "../../../components/forms/FormSuccessScreen.js";
import { createInterviewSubmittedNotification } from "../../../domain/notifications/utils.js";
import { uploadImage } from "../../../services/storage.js";
import { routeParam } from "../../../lib/routeParam.js";
const GET = createRoute(async (c) => {
  const tokenId = routeParam(c, "tokenId");
  const [err, interview] = await getInterviewByToken(tokenId);
  if (err || !interview)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Invalid interview link" }));
  if (interview.status === "completed") {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { isSuccess: true, errorMessage: "Interview already completed." })
    );
  }
  if (interview.status === "expired") {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "This interview link has expired." }));
  }
  if (interview.status !== "sent") {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Invalid interview link" }));
  }
  const [creatorErr, creator] = await getCreatorById(interview?.creatorId);
  if (creatorErr || !creator)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found" }));
  return c.html(/* @__PURE__ */ jsx(IntervewForm, { inviteToken: tokenId, creator }));
});
const POST = createRoute(
  formValidator(interviewFormSchema),
  async (c) => {
    const inviteToken = routeParam(c, "tokenId");
    const form = c.req.valid("form");
    if (!inviteToken) return showErrorAlert(c, "Invalid interview link");
    let promoImageUrl = null;
    const body = await c.req.parseBody();
    const file = body["promoImage"];
    if (file) {
      const validated = validateImageFile(file);
      if (!validated.success) return showErrorAlert(c, validated.error);
      try {
        const result = await uploadImage(
          validated.file,
          "interviews/promo",
          "cover"
        );
        promoImageUrl = result.url;
      } catch {
        return showErrorAlert(c, "Failed to upload image");
      }
    }
    if (!promoImageUrl) return showErrorAlert(c, "Promo image is required");
    const [error, row] = await completeInterviewByToken(
      inviteToken,
      form,
      promoImageUrl
    );
    if (error) return showErrorAlert(c, error.reason);
    const [creatorErr, creator] = await getCreatorById(row.creatorId);
    if (creatorErr || !creator) return showErrorAlert(c, "Creator not found");
    await createInterviewSubmittedNotification(creator);
    return c.html(
      /* @__PURE__ */ jsx(
        FormSuccessScreen,
        {
          id: "interview-form",
          message: "Thank you. Interview submitted."
        }
      )
    );
  }
);
export {
  GET,
  POST
};
