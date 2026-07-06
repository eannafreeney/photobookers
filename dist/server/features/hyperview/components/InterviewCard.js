import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { formatDate } from "../../../utils.js";
const InterviewCard = ({
  interview,
  href,
  variant = "carousel"
}) => {
  const cardStyle = variant === "list" ? "interview-list-card" : "interview-card";
  const imageStyle = variant === "list" ? "interview-list-card-image" : "interview-card-image";
  const overlayStyle = variant === "list" ? "interview-list-card-overlay" : "interview-card-overlay";
  return /* @__PURE__ */ jsxs(View, { style: cardStyle, children: [
    /* @__PURE__ */ jsx(Behavior, { href }),
    interview.promoImageUrl && /* @__PURE__ */ jsx(
      Image,
      {
        source: interview.promoImageUrl,
        style: imageStyle,
        "resize-mode": "cover"
      }
    ),
    /* @__PURE__ */ jsxs(View, { style: overlayStyle, children: [
      /* @__PURE__ */ jsx(Text, { style: "interview-card-eyebrow", children: "INTERVIEW" }),
      /* @__PURE__ */ jsx(Text, { style: "interview-card-name", children: interview.creator.displayName }),
      interview.completedAt && /* @__PURE__ */ jsx(Text, { style: "interview-card-date", children: formatDate(interview.completedAt) })
    ] })
  ] });
};
var InterviewCard_default = InterviewCard;
const interviewCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-card",
      width: 220,
      height: 256,
      borderRadius: 0,
      overflow: "hidden",
      marginRight: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "interview-card-image", width: 220, height: 256 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-list-card",
      width: "100%",
      height: 280,
      borderRadius: 0,
      overflow: "hidden",
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "interview-list-card-image", width: "100%", height: 280 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-card-overlay",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-list-card-overlay",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 4
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-card-eyebrow",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2,
      color: "rgba(255,255,255,0.75)"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-card-name",
      fontFamily: "Fraunces-Medium",
      fontSize: 22,
      color: "#fbfaf7",
      textAlign: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-card-date",
      fontSize: 11,
      color: "rgba(255,255,255,0.7)"
    }
  )
] });
export {
  InterviewCard_default as default,
  interviewCardStyles
};
