import { FC } from "hono/jsx";
import type { BookFair } from "../../../db/schema";
import type { AuthUser } from "../../../../types";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";
import {
  canClaimFairAttendance,
  canWithdrawFairAttendance,
} from "../../../lib/permissions";

export const fairAttendButtonId = (fairId: string) => `fair-attend-${fairId}`;

export const fairAttendanceSectionId = (fairId: string) =>
  `fair-attendance-${fairId}`;

type FairAttendFair = Pick<
  BookFair,
  "id" | "status" | "approvalStatus" | "endDate" | "startDate"
>;

type Props = {
  fair: FairAttendFair;
  user: AuthUser | null;
  baseUrl: string;
  isAttending: boolean;
};

export const HyperviewFairAttendInner = ({
  fair,
  user,
  baseUrl,
  isAttending,
}: Props) => {
  const action = `${baseUrl}/api/fairs/${fair.id}/attend`;
  const sectionTarget = fairAttendanceSectionId(fair.id);

  if (isAttending) {
    const canWithdraw =
      user?.creator &&
      canWithdrawFairAttendance(user, fair, user.creator.id);

    return (
      <>
        <Text style="fair-attend-status">You're attending</Text>
        {canWithdraw ? (
          <View style="fair-attend-withdraw">
            <Text style="fair-attend-withdraw-label">Withdraw</Text>
            <Behavior
              verb="delete"
              action="replace-inner"
              href={action}
              target={sectionTarget}
            />
          </View>
        ) : null}
      </>
    );
  }

  if (!user) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to mark yourself as attending this fair.")}`;
    return (
      <>
        <Text style="fair-attend-label">I'm attending this fair</Text>
        <Behavior verb="get" action="new" href={modalHref} />
      </>
    );
  }

  if (!user.creator) {
    return (
      <Text style="fair-attend-hint">
        Set up your creator profile to mark yourself as attending.
      </Text>
    );
  }

  if (user.creator.status !== "verified") {
    return (
      <Text style="fair-attend-hint">
        Only verified creators can mark attendance at fairs.
      </Text>
    );
  }

  if (!canClaimFairAttendance(user, fair)) {
    return <></>;
  }

  return (
    <>
      <Text style="fair-attend-label">I'm attending this fair</Text>
      <Behavior
        verb="post"
        action="replace-inner"
        href={action}
        target={sectionTarget}
      />
    </>
  );
};

const FairAttendButton: FC<Props> = (props) => {
  const buttonId = fairAttendButtonId(props.fair.id);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const isPastFair = new Date(props.fair.endDate) < today;

  if (isPastFair) return <></>;

  return (
    <View style="fair-attend-btn" id={buttonId}>
      <HyperviewFairAttendInner {...props} />
    </View>
  );
};

export default FairAttendButton;

export const fairAttendButtonStyles = () => (
  <>
    <Style
      id="fair-attend-btn"
      borderWidth={1}
      borderColor="#191613"
      borderRadius={0}
      paddingTop={14}
      paddingBottom={14}
      paddingLeft={20}
      paddingRight={20}
      alignItems="center"
      marginTop={8}
      marginBottom={8}
    />
    <Style
      id="fair-attend-label"
      fontSize={15}
      fontWeight="600"
      color="#191613"
    />
    <Style
      id="fair-attend-status"
      fontSize={14}
      fontWeight="600"
      color="#a22c29"
    />
    <Style
      id="fair-attend-hint"
      fontSize={13}
      color="#45413a"
      textAlign="center"
      lineHeight={20}
    />
    <Style
      id="fair-attend-withdraw"
      marginTop={8}
      paddingTop={4}
      paddingBottom={4}
      alignItems="center"
    />
    <Style
      id="fair-attend-withdraw-label"
      fontSize={13}
      color="#45413a"
      textDecorationLine="underline"
    />
  </>
);
