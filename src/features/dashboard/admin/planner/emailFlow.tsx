import { Context } from "hono";
import Modal from "../../../../components/app/Modal";
import Alert from "../../../../components/app/Alert";
import SetCreatorEmailModal from "./modals/SetCreatorEmailModal";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { getCreatorEmailById } from "../../creators/services";
import { updateCreatorEmail } from "../creators/services";
import { Child } from "hono/jsx";
import SendAOTWCreatorEmailButton from "./components/SendAOTWCreatorEmailButton";
import {
  updateArtistOfTheWeekByWeekStart,
  updatePublisherOfTheWeekByWeekStart,
} from "./services";
import { sendEmail } from "../../../../lib/sendEmail";
import {
  buildAOTWNotificationEmail,
  buildPOTWNotificationEmail,
} from "./emails";
import {
  sendBookOfTheWeekCreatorEmail,
  sendFeaturedBookCreatorEmail,
} from "./utils";
import { toWeekString } from "../../../../lib/utils";
import SendPOTWCreatorEmailButton from "./components/SendPOTWCreatorEmailButton";

type RequireCreatorEmailParams = {
  creatorId: string;
  weekStart: Date;
  action: string;
  title: string;
  bookId?: string | null;
  recipientType?: "artist" | "publisher" | null;
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
        <Modal title={params.title}>
          <SetCreatorEmailModal
            creatorId={params.creatorId}
            weekStart={params.weekStart}
            action={params.action}
            bookId={params.bookId ?? undefined}
            recipientType={params.recipientType ?? undefined}
          />
        </Modal>,
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

/**
 * Shared success fragment used by multiple planner routes.
 */
export function plannerEmailSuccessFragment(children: Child) {
  return (
    <>
      <Alert type="success" message="Email Sent" />
      {children}
      {dispatchEvents(["planner:updated"])}
    </>
  );
}

type AOTWExecuteParams = {
  c: Context;
  creator: CreatorForEmail;
  creatorId: string;
  weekStart: Date;
};

export async function executeAOTWEmail({
  c,
  creator,
  creatorId,
  weekStart,
}: AOTWExecuteParams) {
  const html = buildAOTWNotificationEmail(creator);
  const [emailError] = await sendEmail(
    creator.email,
    "Congrats! You are Artist of the Week at photobookers",
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const [updateError, updatedArtistOfTheWeek] =
    await updateArtistOfTheWeekByWeekStart(weekStart);
  if (updateError) return showErrorAlert(c, updateError.reason);

  return c.html(
    plannerEmailSuccessFragment(
      <SendAOTWCreatorEmailButton
        artistOfTheWeek={updatedArtistOfTheWeek}
        creatorId={creatorId}
      />,
    ),
  );
}

type POTWExecuteParams = {
  c: Context;
  creator: CreatorForEmail;
  creatorId: string;
  weekStart: Date;
};

export async function executePOTWEmail({
  c,
  creator,
  creatorId,
  weekStart,
}: POTWExecuteParams) {
  const html = buildPOTWNotificationEmail(creator);
  const [emailError] = await sendEmail(
    creator.email,
    "Congrats! You are Publisher of the Week at photobookers",
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const [updateError, updatedPublisherOfTheWeek] =
    await updatePublisherOfTheWeekByWeekStart(weekStart);
  if (updateError) return showErrorAlert(c, updateError.reason);

  return c.html(
    plannerEmailSuccessFragment(
      <SendPOTWCreatorEmailButton
        publisherOfTheWeek={updatedPublisherOfTheWeek}
        creatorId={creatorId}
      />,
    ),
  );
}

type BookCampaignExecuteParams = {
  c: Context;
  creator: CreatorForEmail;
  weekStart: Date;
  recipientType: "artist" | "publisher";
  bookId: string;
};

export async function executeBOTWEmail({
  c,
  creator,
  weekStart,
  recipientType,
  bookId,
}: BookCampaignExecuteParams) {
  return sendBookOfTheWeekCreatorEmail(
    c,
    creator,
    toWeekString(weekStart),
    recipientType,
    bookId,
  );
}

export async function executeFeaturedEmail({
  c,
  creator,
  weekStart,
  recipientType,
  bookId,
}: BookCampaignExecuteParams) {
  return sendFeaturedBookCreatorEmail(
    c,
    toWeekString(weekStart),
    recipientType,
    bookId,
    creator,
  );
}
