import { Context } from "hono";
import Modal from "../../../../components/app/Modal";
import Alert from "../../../../components/app/Alert";
import SetCreatorEmailModal from "./modals/SetCreatorEmailModal";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getCreatorEmailById } from "../../creators/services";
import { updateCreatorEmail } from "../creators/services";
import { Child } from "hono/jsx";
import {
  updateArtistOfTheWeekByWeekStart,
  updateBookOfTheDayByDate,
  updatePublisherOfTheWeekByWeekStart,
} from "./services";
import { sendEmail } from "../../../../lib/sendEmail";
import { prepareBotdAdvanceNotificationContent } from "./botdEmailServices";
import { buildCreatorOfTheWeekNotificationEmail } from "./emails";
import { getBookByIdBasic } from "../../books/services";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../lib/utils";
import { ensureInterviewInviteForSpotlight } from "./interviewFlow";
import { getUser } from "../../../../utils";
import { renderPlannerEmailSuccess } from "./renderPlannerEmailSuccess";
import type { EmailStatusBadgeProps } from "./components/EmailStatusBadge";
import { aotwPath } from "../../../app/spotlightUrls";

type RequireCreatorEmailParams = {
  creatorId: string;
  /** Week-start Monday (UTC) for AOTW/POTW flows. */
  weekStart?: Date | null;
  /** Day (UTC midnight) for BOTD flows. */
  date?: Date | null;
  action: string;
  title: string;
  bookId?: string | null;
  recipientType?: "artist" | "publisher" | null;
  fallbackTargetNode?: Child;
  targetId: string;
};

type EnsureCreatorEmailParams = {
  creatorId: string;
  email: string;
};

export type CreatorForEmail = {
  id: string;
  displayName: string;
  email: string;
  type: "artist" | "publisher";
  slug: string;
  ownerUserId: string | null;
};

const toCreatorForEmail = (creator: {
  id: string;
  displayName: string;
  email: string | null;
  type: "artist" | "publisher";
  slug: string;
  ownerUserId: string | null;
}): CreatorForEmail | null => {
  if (!creator.email) return null;
  return {
    id: creator.id,
    displayName: creator.displayName,
    email: creator.email,
    type: creator.type,
    slug: creator.slug,
    ownerUserId: creator.ownerUserId,
  };
};

/**
 * Shared for send-creator-email routes:
 * - fetch creator
 * - if no email, render SetCreatorEmailModal
 * - else return normalized creator for email sending
 */
export async function requireCreatorEmailOrRenderModal(
  c: Context,
  params: RequireCreatorEmailParams,
): Promise<{
  response: Response | Promise<Response> | null;
  creator: CreatorForEmail | null;
}> {
  const [err, creator] = await getCreatorEmailById(params.creatorId);
  if (err || !creator) {
    return {
      response: showErrorAlert(c, "Creator not found"),
      creator: null,
    };
  }

  if (!creator.email) {
    return {
      response: c.html(
        <>
          <Modal title={params.title}>
            <SetCreatorEmailModal
              creatorId={params.creatorId}
              weekStart={params.weekStart ?? undefined}
              date={params.date ?? undefined}
              action={params.action}
              bookId={params.bookId ?? undefined}
              recipientType={params.recipientType ?? undefined}
              targetId={params.targetId}
            />
          </Modal>
          {params.fallbackTargetNode}
          <div id="modal-root"></div>
          <div id="toast"></div>
        </>,
      ),
      creator: null,
    };
  }

  return { response: null, creator: toCreatorForEmail(creator) };
}

/**
 * Shared for set-send-email routes:
 * - update creator email
 * - return normalized creator or error response
 */
export async function updateCreatorEmailOrError(
  c: Context,
  params: EnsureCreatorEmailParams,
): Promise<{
  response: Response | Promise<Response> | null;
  creator: CreatorForEmail | null;
}> {
  const [updateError, updatedCreator] = await updateCreatorEmail(
    params.creatorId,
    params.email,
  );

  if (updateError || !updatedCreator) {
    return {
      response: showErrorAlert(c, "Failed to update creator email"),
      creator: null,
    };
  }

  const ready = toCreatorForEmail(updatedCreator);
  if (!ready) {
    return {
      response: showErrorAlert(c, "Failed to update creator email"),
      creator: null,
    };
  }

  return { response: null, creator: ready };
}

type AOTWExecuteParams = {
  c: Context;
  creator: CreatorForEmail;
  creatorId: string;
  weekStart: Date;
  badge: EmailStatusBadgeProps;
};

export async function executeAOTWEmail({
  c,
  creator,
  creatorId,
  weekStart,
  badge,
}: AOTWExecuteParams) {
  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "Not signed in");

  const [ensureError, ensureResult] = await ensureInterviewInviteForSpotlight({
    creatorId,
    creatorSlug: creator.slug,
    invitedByUserId: user.id,
    recipientEmail: creator.email,
  });

  if (ensureError) return showErrorAlert(c, ensureError.reason);
  const { interview, interviewLink, created } = ensureResult;

  const html = buildCreatorOfTheWeekNotificationEmail({
    ...creator,
    weekStart,
    interviewLink,
    interviewStatus: interview?.status ?? null,
  });

  const [emailError] = await sendEmail(
    creator.email,
    "Congrats! You are Artist of the Week at photobookers",
    html,
  );

  if (emailError) return showErrorAlert(c, emailError.reason);

  const [updateError, updatedArtistOfTheWeek] =
    await updateArtistOfTheWeekByWeekStart(weekStart);
  if (updateError) return showErrorAlert(c, updateError.reason);

  return renderPlannerEmailSuccess(c, creator, {
    ...badge,
    sentAt: updatedArtistOfTheWeek.emailSentAt,
    hasEmail: true,
    manualSend: badge.manualSend
      ? { ...badge.manualSend, advanceSent: true }
      : undefined,
  });
}

type POTWExecuteParams = {
  c: Context;
  creator: CreatorForEmail;
  creatorId: string;
  weekStart: Date;
  badge: EmailStatusBadgeProps;
};

export async function executePOTWEmail({
  c,
  creator,
  creatorId,
  weekStart,
  badge,
}: POTWExecuteParams) {
  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "Not signed in");

  const [ensureError, ensureResult] = await ensureInterviewInviteForSpotlight({
    creatorId,
    creatorSlug: creator.slug,
    invitedByUserId: user.id,
    recipientEmail: creator.email,
  });

  if (ensureError) return showErrorAlert(c, ensureError.reason);
  const { interview, interviewLink, created } = ensureResult;

  const html = buildCreatorOfTheWeekNotificationEmail({
    ...creator,
    weekStart,
    interviewLink,
    interviewStatus: interview?.status ?? null,
  });

  const [emailError] = await sendEmail(
    creator.email,
    "Congrats! You are Publisher of the Week at photobookers",
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const [updateError, updatedPublisherOfTheWeek] =
    await updatePublisherOfTheWeekByWeekStart(weekStart);
  if (updateError) return showErrorAlert(c, updateError.reason);

  return renderPlannerEmailSuccess(c, creator, {
    ...badge,
    sentAt: updatedPublisherOfTheWeek.emailSentAt,
    hasEmail: true,
    manualSend: badge.manualSend
      ? { ...badge.manualSend, advanceSent: true }
      : undefined,
  });
}

type BOTDExecuteParams = {
  c: Context;
  creator: CreatorForEmail;
  date: Date;
  recipientType: "artist" | "publisher";
  bookId: string;
  badge: EmailStatusBadgeProps;
};

export async function executeBOTDEmail({
  c,
  creator,
  date,
  recipientType,
  bookId,
  badge,
}: BOTDExecuteParams) {
  const [bookError, book] = await getBookByIdBasic(bookId);
  if (bookError || !book) return showErrorAlert(c, "Book not found");

  const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
  const { html, subject } = await prepareBotdAdvanceNotificationContent({
    creator,
    book,
    date: botdDay,
  });
  const [emailError] = await sendEmail(creator.email, subject, html);
  if (emailError) return showErrorAlert(c, emailError.reason);

  const updateField =
    recipientType === "artist" ? "artistEmailSentAt" : "publisherEmailSentAt";

  const [updateError, updatedBookOfTheDay] = await updateBookOfTheDayByDate(
    botdDay,
    {
      [updateField]: new Date(),
    },
  );
  if (updateError) return showErrorAlert(c, updateError.reason);

  const sentAt =
    recipientType === "artist"
      ? updatedBookOfTheDay.artistEmailSentAt
      : updatedBookOfTheDay.publisherEmailSentAt;

  return renderPlannerEmailSuccess(c, creator, {
    ...badge,
    sentAt,
    hasEmail: true,
  });
}
