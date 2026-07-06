import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { formatDate } from "../../../utils.js";
import FairAttendingCreators, {
  fairAttendingCreatorsStyles
} from "./FairAttendingCreators.js";
import FairAttendanceSection, {
  fairAttendanceSectionStyles
} from "./FairAttendanceSection.js";
import { fairCardStyles } from "./FairCard.js";
import ExpandableBio, { expandableBioStyles } from "./spotlight/ExpandableBio.js";
const FairDetailBody = ({ fair, user, baseUrl, isAttending }) => {
  const location = fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country || null;
  return /* @__PURE__ */ jsxs(View, { style: "fair-detail", children: [
    fair.bannerUrl ? /* @__PURE__ */ jsx(
      Image,
      {
        source: fair.bannerUrl,
        style: "fair-detail-banner",
        "resize-mode": "cover"
      }
    ) : fair.coverUrl ? /* @__PURE__ */ jsx(
      Image,
      {
        source: fair.coverUrl,
        style: "fair-detail-banner",
        "resize-mode": "cover"
      }
    ) : null,
    /* @__PURE__ */ jsx(Text, { style: "fair-detail-title", children: fair.name }),
    /* @__PURE__ */ jsxs(View, { style: "fair-detail-meta", children: [
      /* @__PURE__ */ jsx(View, { style: "fair-detail-pill", children: /* @__PURE__ */ jsxs(Text, { style: "fair-detail-pill-text", children: [
        formatDate(fair.startDate),
        " \u2013 ",
        formatDate(fair.endDate)
      ] }) }),
      location ? /* @__PURE__ */ jsx(View, { style: "fair-detail-pill", children: /* @__PURE__ */ jsx(Text, { style: "fair-detail-pill-text", children: location }) }) : null,
      fair.venue ? /* @__PURE__ */ jsx(View, { style: "fair-detail-pill", children: /* @__PURE__ */ jsx(Text, { style: "fair-detail-pill-text", children: fair.venue }) }) : null
    ] }),
    /* @__PURE__ */ jsx(
      FairAttendanceSection,
      {
        fair,
        user,
        baseUrl,
        isAttending
      }
    ),
    fair.description ? /* @__PURE__ */ jsx(View, { style: "fair-detail-description", children: /* @__PURE__ */ jsx(
      ExpandableBio,
      {
        id: fair.id,
        bio: fair.description,
        textStyle: "fair-detail-description-text",
        maxWords: 40
      }
    ) }) : null,
    /* @__PURE__ */ jsx(FairAttendingCreators, { fairId: fair.id, baseUrl, user }),
    fair.website ? /* @__PURE__ */ jsxs(View, { style: "fair-detail-website-btn", children: [
      /* @__PURE__ */ jsx(Text, { style: "fair-detail-website-label", children: "Visit Fair Website" }),
      /* @__PURE__ */ jsx(Behavior, { href: fair.website, action: "new" })
    ] }) : null
  ] });
};
var FairDetailBody_default = FairDetailBody;
const fairDetailBodyStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  fairCardStyles(),
  fairAttendanceSectionStyles(),
  fairAttendingCreatorsStyles(),
  expandableBioStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail",
      flexDirection: "column",
      gap: 16,
      paddingBottom: 32
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "fair-detail-banner", width: "100%", height: 220 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-title",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 28,
      color: "#191613",
      textAlign: "center",
      lineHeight: 34,
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-meta",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-pill",
      backgroundColor: "#f2efe8",
      borderRadius: 20,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 14,
      paddingRight: 14
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-pill-text",
      fontSize: 13,
      fontWeight: "500",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-description",
      backgroundColor: "#f2efe8",
      borderRadius: 12,
      padding: 16,
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-description-text",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-website-btn",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      alignItems: "center",
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fair-detail-website-label",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  FairDetailBody_default as default,
  fairDetailBodyStyles
};
