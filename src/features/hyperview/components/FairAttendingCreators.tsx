import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { getFairAttendees } from "../../fair-attendees/services";
import { followFlagsForCreators } from "../findFlags";
import { capitalize } from "../../../utils";
import SpotlightCreatorRow, {
  spotlightCreatorRowStyles,
} from "./spotlight/SpotlightCreatorRow";
import { followButtonStyles } from "./FollowButton";

type Props = {
  fairId: string;
  baseUrl: string;
  user?: AuthUser | null;
};

const FairAttendingCreators: FC<Props> = async ({
  fairId,
  baseUrl,
  user = null,
}) => {
  const [attendeesError, attendees] = await getFairAttendees(fairId);
  if (attendeesError || attendees.length === 0) return <></>;

  const creators = attendees.map((attendee) => attendee.creator);
  const followingByCreatorId = await followFlagsForCreators(user, creators);

  return (
    <View style="fair-attending-creators" id="fair-attending-creators">
      <Text style="fair-attending-title">Attending Creators</Text>
      <Text style="fair-attending-count">
        {attendees.length}{" "}
        {attendees.length === 1 ? "creator" : "creators"} attending this fair
      </Text>
      <View style="fair-attending-list">
        {attendees.map((attendee) => (
          <SpotlightCreatorRow
            key={attendee.creator.id}
            creator={attendee.creator}
            role={capitalize(attendee.creator.type)}
            baseUrl={baseUrl}
            isFollowing={followingByCreatorId[attendee.creator.id] ?? false}
          />
        ))}
      </View>
    </View>
  );
};

export default FairAttendingCreators;

export const fairAttendingCreatorsStyles = () => (
  <>
    {spotlightCreatorRowStyles()}
    {followButtonStyles()}
    <Style
      id="fair-attending-creators"
      flexDirection="column"
      gap={12}
      marginTop={24}
      paddingTop={24}
      borderTopWidth={1}
      borderTopColor="#e4e0d5"
    />
    <Style
      id="fair-attending-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={22}
      color="#191613"
      textAlign="center"
    />
    <Style
      id="fair-attending-count"
      fontSize={14}
      color="#45413a"
      textAlign="center"
      marginBottom={8}
    />
    <Style id="fair-attending-list" flexDirection="column" gap={12} />
  </>
);
