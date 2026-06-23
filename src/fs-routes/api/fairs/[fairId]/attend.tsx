import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import AuthModal from "../../../../components/app/AuthModal";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import {
  requestFairAttendance,
  withdrawFairAttendance,
  isCreatorAttendingFair,
} from "../../../../features/fair-attendees/services";
import { db } from "../../../../db/client";
import { bookFairs } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance,
} from "../../../../lib/permissions";
import WebFairAttendButton from "../../../../features/app/fairs/components/FairAttendButton";
import WebFairAttendingCreators from "../../../../features/app/fairs/components/FairAttendingCreators";
import { hyperview } from "../../../../lib/hxml";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { getBaseUrl } from "../../../../lib/hyperview";
import { Behavior, Text, View } from "../../../../lib/hxml-comps";
import HyperviewFairAttendButton from "../../../../features/hyperview/components/FairAttendButton";

const getFairForAttend = async (fairId: string) => {
  return db.query.bookFairs.findFirst({
    where: eq(bookFairs.id, fairId),
    columns: {
      id: true,
      name: true,
      slug: true,
      status: true,
      approvalStatus: true,
      startDate: true,
      endDate: true,
    },
  });
};

const renderAttendResponse = async (
  c: Context,
  fairId: string,
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  message: string,
  isAttending: boolean,
) => {
  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");

  return c.html(
    <>
      <Alert type="success" message={message} />
      <WebFairAttendButton fair={fair} user={user} isAttending={isAttending} />
      <WebFairAttendingCreators fairId={fairId} />
    </>,
  );
};

const renderAttendResponseHyperview = async (
  c: Context,
  fairId: string,
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  isAttending: boolean,
) => {
  const fair = await getFairForAttend(fairId);
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);

  if (!fair) {
    return hv(
      <text xmlns="https://hyperview.org/hyperview" style="fair-attend-hint">
        Fair not found
      </text>,
    );
  }

  return hv(
    <View xmlns="https://hyperview.org/hyperview">
      <HyperviewFairAttendButton
        fair={fair}
        user={user}
        baseUrl={baseUrl}
        isAttending={isAttending}
      />
      <View hide="true">
        <Behavior
          trigger="load"
          verb="get"
          action="replace"
          target="fair-attending-creators"
          href={`${baseUrl}/hyperview/fairs/${fair.slug}/attending-creators`}
        />
      </View>
    </View>,
  );
};

const renderAttendErrorHyperview = (c: Context, message: string) => {
  const hv = hyperview(c);
  return hv(
    <text xmlns="https://hyperview.org/hyperview" style="fair-attend-hint">
      {message}
    </text>,
  );
};

const renderAttendAuthHyperview = (c: Context) => {
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to mark yourself as attending this fair.")}`;

  return hv(
    <View xmlns="https://hyperview.org/hyperview">
      <Behavior trigger="load" action="new" verb="get" href={modalHref} />
      <Text style="fair-attend-label">I'm attending this fair</Text>
      <Behavior verb="get" action="new" href={modalHref} />
    </View>,
    401,
  );
};

export const POST = createRoute(async (c: Context) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postAttendHyperview(c) : postAttendWeb(c);
});

export const DELETE = createRoute(async (c: Context) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? deleteAttendHyperview(c) : deleteAttendWeb(c);
});

const postAttendWeb = async (c: Context) => {
  const fairId = c.req.param("fairId");
  const user = await getUser(c);

  if (!user?.id) {
    return c.html(
      <AuthModal action="to mark yourself as attending this fair." />,
      401,
    );
  }

  if (!user.creator) {
    return showErrorAlert(c, "You need a creator profile to attend fairs");
  }

  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");

  if (!canClaimFairAttendance(user, fair)) {
    return showErrorAlert(c, "You cannot request attendance at this fair");
  }

  const [attendingError, alreadyAttending] = await isCreatorAttendingFair(
    fairId,
    user.creator.id,
  );
  if (attendingError) return showErrorAlert(c, attendingError.reason);
  if (alreadyAttending) {
    return renderAttendResponse(
      c,
      fairId,
      user,
      "You are already attending this fair.",
      true,
    );
  }

  const [error] = await requestFairAttendance(fairId, user.creator.id);
  if (error) return showErrorAlert(c, error.reason);

  return renderAttendResponse(
    c,
    fairId,
    user,
    "You're now marked as attending this fair.",
    true,
  );
};

const deleteAttendWeb = async (c: Context) => {
  const fairId = c.req.param("fairId");
  const user = await getUser(c);

  if (!user?.id) {
    return c.html(<AuthModal action="to update your fair attendance." />, 401);
  }

  if (!user.creator) {
    return showErrorAlert(c, "You need a creator profile");
  }

  const fair = await getFairForAttend(fairId);
  if (!fair) return showErrorAlert(c, "Fair not found");

  if (!canWithdrawFairAttendance(user, fair, user.creator.id)) {
    return showErrorAlert(c, "You cannot withdraw from this fair");
  }

  const [error] = await withdrawFairAttendance(fairId, user.creator.id);
  if (error) return showErrorAlert(c, error.reason);

  return renderAttendResponse(
    c,
    fairId,
    user,
    "You are no longer marked as attending this fair.",
    false,
  );
};

const postAttendHyperview = async (c: Context) => {
  const fairId = c.req.param("fairId");
  const user = await getUser(c);

  if (!user?.id) {
    return renderAttendAuthHyperview(c);
  }

  if (!user.creator) {
    return renderAttendErrorHyperview(
      c,
      "You need a creator profile to attend fairs",
    );
  }

  const fair = await getFairForAttend(fairId);
  if (!fair) return renderAttendErrorHyperview(c, "Fair not found");

  if (!canClaimFairAttendance(user, fair)) {
    return renderAttendErrorHyperview(
      c,
      "You cannot request attendance at this fair",
    );
  }

  const [attendingError, alreadyAttending] = await isCreatorAttendingFair(
    fairId,
    user.creator.id,
  );
  if (attendingError) {
    return renderAttendErrorHyperview(c, attendingError.reason);
  }
  if (alreadyAttending) {
    return renderAttendResponseHyperview(c, fairId, user, true);
  }

  const [error] = await requestFairAttendance(fairId, user.creator.id);
  if (error) return renderAttendErrorHyperview(c, error.reason);

  return renderAttendResponseHyperview(c, fairId, user, true);
};

const deleteAttendHyperview = async (c: Context) => {
  const fairId = c.req.param("fairId");
  const user = await getUser(c);

  if (!user?.id) {
    return renderAttendAuthHyperview(c);
  }

  if (!user.creator) {
    return renderAttendErrorHyperview(c, "You need a creator profile");
  }

  const fair = await getFairForAttend(fairId);
  if (!fair) return renderAttendErrorHyperview(c, "Fair not found");

  if (!canWithdrawFairAttendance(user, fair, user.creator.id)) {
    return renderAttendErrorHyperview(c, "You cannot withdraw from this fair");
  }

  const [error] = await withdrawFairAttendance(fairId, user.creator.id);
  if (error) return renderAttendErrorHyperview(c, error.reason);

  return renderAttendResponseHyperview(c, fairId, user, false);
};
