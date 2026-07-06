import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Style, Text, View } from "../../../../lib/hxml-comps.js";
import SectionHeader from "../SectionHeader.js";
import InterviewCard from "../InterviewCard.js";
const InterviewSection = ({
  publishedInterview,
  interviewUrl,
  interviewTeaser,
  creator
}) => /* @__PURE__ */ jsxs(View, { children: [
  /* @__PURE__ */ jsx(SectionHeader, { title: "Interview" }),
  publishedInterview.promoImageUrl ? /* @__PURE__ */ jsx(
    InterviewCard,
    {
      interview: publishedInterview,
      href: interviewUrl,
      variant: "list"
    }
  ) : null,
  interviewTeaser ? /* @__PURE__ */ jsx(Text, { style: "spotlight-interview-teaser", children: interviewTeaser }) : null,
  /* @__PURE__ */ jsxs(View, { children: [
    /* @__PURE__ */ jsxs(Text, { style: "spotlight-interview-link", children: [
      "Read the full interview with ",
      creator.displayName
    ] }),
    /* @__PURE__ */ jsx(Behavior, { href: interviewUrl })
  ] })
] });
var InterviewSection_default = InterviewSection;
const interviewSectionStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-interview-teaser",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 20,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-interview-link",
      fontSize: 14,
      color: "#a22c29",
      marginBottom: 16
    }
  )
] });
export {
  InterviewSection_default as default,
  interviewSectionStyles
};
