import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../components/app/Modal.js";
import SetCreatorEmailModal from "./modals/SetCreatorEmailModal.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { getCreatorEmailById } from "../../creators/services.js";
import { updateCreatorEmail } from "../creators/services.js";
import {
  updateArtistOfTheWeekByWeekStart,
  updateBookOfTheDayByDate,
  updatePublisherOfTheWeekByWeekStart
} from "./services.js";
import { sendEmail } from "../../../../lib/sendEmail.js";
import { prepareBotdAdvanceNotificationContent } from "./botdEmailServices.js";
import { buildCreatorOfTheWeekNotificationEmail } from "./emails.js";
import { getBookByIdBasic } from "../../books/services.js";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../lib/utils.js";
import { ensureInterviewInviteForSpotlight } from "./interviewFlow.js";
import { getUser } from "../../../../utils.js";
import { renderPlannerEmailSuccess } from "./renderPlannerEmailSuccess.js";
const toCreatorForEmail = (creator) => {
  if (!creator.email) return null;
  return {
    id: creator.id,
    displayName: creator.displayName,
    email: creator.email,
    type: creator.type,
    slug: creator.slug,
    ownerUserId: creator.ownerUserId
  };
};
async function requireCreatorEmailOrRenderModal(c, params) {
  const [err, creator] = await getCreatorEmailById(params.creatorId);
  if (err || !creator) {
    return {
      response: showErrorAlert(c, "Creator not found"),
      creator: null
    };
  }
  if (!creator.email) {
    return {
      response: c.html(
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Modal, { title: params.title, children: /* @__PURE__ */ jsx(
            SetCreatorEmailModal,
            {
              creatorId: params.creatorId,
              weekStart: params.weekStart ?? void 0,
              date: params.date ?? void 0,
              action: params.action,
              bookId: params.bookId ?? void 0,
              recipientType: params.recipientType ?? void 0,
              targetId: params.targetId
            }
          ) }),
          params.fallbackTargetNode,
          /* @__PURE__ */ jsx("div", { id: "modal-root" }),
          /* @__PURE__ */ jsx("div", { id: "toast" })
        ] })
      ),
      creator: null
    };
  }
  return { response: null, creator: toCreatorForEmail(creator) };
}
async function updateCreatorEmailOrError(c, params) {
  const [updateError, updatedCreator] = await updateCreatorEmail(
    params.creatorId,
    params.email
  );
  if (updateError || !updatedCreator) {
    return {
      response: showErrorAlert(c, "Failed to update creator email"),
      creator: null
    };
  }
  const ready = toCreatorForEmail(updatedCreator);
  if (!ready) {
    return {
      response: showErrorAlert(c, "Failed to update creator email"),
      creator: null
    };
  }
  return { response: null, creator: ready };
}
async function executeAOTWEmail({
  c,
  creator,
  creatorId,
  weekStart,
  badge
}) {
  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "Not signed in");
  const [ensureError, ensureResult] = await ensureInterviewInviteForSpotlight({
    creatorId,
    creatorSlug: creator.slug,
    invitedByUserId: user.id,
    recipientEmail: creator.email
  });
  if (ensureError) return showErrorAlert(c, ensureError.reason);
  const { interview, interviewLink, created } = ensureResult;
  const html = buildCreatorOfTheWeekNotificationEmail({
    ...creator,
    weekStart,
    interviewLink,
    interviewStatus: interview?.status ?? null
  });
  const [emailError] = await sendEmail(
    creator.email,
    "Congrats! You are Artist of the Week at photobookers",
    html
  );
  if (emailError) return showErrorAlert(c, emailError.reason);
  const [updateError, updatedArtistOfTheWeek] = await updateArtistOfTheWeekByWeekStart(weekStart);
  if (updateError) return showErrorAlert(c, updateError.reason);
  return renderPlannerEmailSuccess(c, creator, {
    ...badge,
    sentAt: updatedArtistOfTheWeek.emailSentAt,
    hasEmail: true,
    manualSend: badge.manualSend ? { ...badge.manualSend, advanceSent: true } : void 0
  });
}
async function executePOTWEmail({
  c,
  creator,
  creatorId,
  weekStart,
  badge
}) {
  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "Not signed in");
  const [ensureError, ensureResult] = await ensureInterviewInviteForSpotlight({
    creatorId,
    creatorSlug: creator.slug,
    invitedByUserId: user.id,
    recipientEmail: creator.email
  });
  if (ensureError) return showErrorAlert(c, ensureError.reason);
  const { interview, interviewLink, created } = ensureResult;
  const html = buildCreatorOfTheWeekNotificationEmail({
    ...creator,
    weekStart,
    interviewLink,
    interviewStatus: interview?.status ?? null
  });
  const [emailError] = await sendEmail(
    creator.email,
    "Congrats! You are Publisher of the Week at photobookers",
    html
  );
  if (emailError) return showErrorAlert(c, emailError.reason);
  const [updateError, updatedPublisherOfTheWeek] = await updatePublisherOfTheWeekByWeekStart(weekStart);
  if (updateError) return showErrorAlert(c, updateError.reason);
  return renderPlannerEmailSuccess(c, creator, {
    ...badge,
    sentAt: updatedPublisherOfTheWeek.emailSentAt,
    hasEmail: true,
    manualSend: badge.manualSend ? { ...badge.manualSend, advanceSent: true } : void 0
  });
}
async function executeBOTDEmail({
  c,
  creator,
  date,
  recipientType,
  bookId,
  badge
}) {
  const [bookError, book] = await getBookByIdBasic(bookId);
  if (bookError || !book) return showErrorAlert(c, "Book not found");
  const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
  const { html, subject } = await prepareBotdAdvanceNotificationContent({
    creator,
    book,
    date: botdDay
  });
  const [emailError] = await sendEmail(creator.email, subject, html);
  if (emailError) return showErrorAlert(c, emailError.reason);
  const updateField = recipientType === "artist" ? "artistEmailSentAt" : "publisherEmailSentAt";
  const [updateError, updatedBookOfTheDay] = await updateBookOfTheDayByDate(
    botdDay,
    {
      [updateField]: /* @__PURE__ */ new Date()
    }
  );
  if (updateError) return showErrorAlert(c, updateError.reason);
  const sentAt = recipientType === "artist" ? updatedBookOfTheDay.artistEmailSentAt : updatedBookOfTheDay.publisherEmailSentAt;
  return renderPlannerEmailSuccess(c, creator, {
    ...badge,
    sentAt,
    hasEmail: true
  });
}
export {
  executeAOTWEmail,
  executeBOTDEmail,
  executePOTWEmail,
  requireCreatorEmailOrRenderModal,
  updateCreatorEmailOrError
};
