import { FC } from "hono/jsx";
import type { BookFair } from "../../../db/schema";
import type { AuthUser } from "../../../../types";
import { Style, View } from "../../../lib/hxml-comps";
import FairAttendButton, {
  fairAttendanceSectionId,
  fairAttendButtonStyles,
} from "./FairAttendButton";

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

const FairAttendanceSection: FC<Props> = ({
  fair,
  user,
  baseUrl,
  isAttending,
}) => (
  <View id={fairAttendanceSectionId(fair.id)} style="fair-attendance-section">
    <FairAttendButton
      fair={fair}
      user={user}
      baseUrl={baseUrl}
      isAttending={isAttending}
    />
  </View>
);

export default FairAttendanceSection;

export const fairAttendanceSectionStyles = () => (
  <>
    {fairAttendButtonStyles()}
    <Style id="fair-attendance-section" flexDirection="column" gap={8} />
  </>
);
