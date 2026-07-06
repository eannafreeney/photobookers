import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import { getFairAttendees } from "../../fair-attendees/services.js";
import { followFlagsForCreators } from "../findFlags.js";
import { capitalize } from "../../../utils.js";
import SpotlightCreatorRow, {
  spotlightCreatorRowStyles
} from "./spotlight/SpotlightCreatorRow.js";
import { followButtonStyles } from "./FollowButton.js";
const FairAttendingCreators = async ({
  fairId,
  baseUrl,
  user = null
}) => {
  const [attendeesError, attendees] = await getFairAttendees(fairId);
  if (attendeesError || attendees.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  const creators = attendees.map((attendee) => attendee.creator);
  const followingByCreatorId = await followFlagsForCreators(user, creators);
  return /* @__PURE__ */ jsxs(View, { style: "fair-attending-creators", id: "fair-attending-creators", children: [
    /* @__PURE__ */ jsx(Text, { style: "fair-attending-title", children: "Attending Creators" }),
    /* @__PURE__ */ jsxs(Text, { style: "fair-attending-count", children: [
      attendees.length,
      " ",
      attendees.length === 1 ? "creator" : "creators",
      " attending this fair"
    ] }),
    /* @__PURE__ */ jsx(View, { style: "fair-attending-list", children: attendees.map((attendee) => /* @__PURE__ */ jsx(
      SpotlightCreatorRow,
      {
        creator: attendee.creator,
        role: capitalize(attendee.creator.type),
        baseUrl,
        isFollowing: followingByCreatorId[attendee.creator.id] ?? false
      },
      attendee.creator.id
    )) })
  ] });
};
var FairAttendingCreators_default = FairAttendingCreators;
const fairAttendingCreatorsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  spotlightCreatorRowStyles(),
  followButtonStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attending-creators",
      flexDirection: "column",
      gap: 12,
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attending-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 22,
      color: "#191613",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-attending-count",
      fontSize: 14,
      color: "#45413a",
      textAlign: "center",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "fair-attending-list", flexDirection: "column", gap: 12 })
] });
export {
  FairAttendingCreators_default as default,
  fairAttendingCreatorsStyles
};
