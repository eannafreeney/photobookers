import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { ScrollView, Style, View } from "../../../lib/hxml-comps.js";
import { getPublishedInterviews } from "../../app/services.js";
import SectionHeader from "./SectionHeader.js";
import InterviewCard, { interviewCardStyles } from "./InterviewCard.js";
const Interviews = async ({ baseUrl = "" }) => {
  const [error, interviews] = await getPublishedInterviews();
  if (error || !interviews?.length) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(View, { style: "interviews-section", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Interviews",
        viewAllHref: `${baseUrl}/hyperview/interviews`
      }
    ),
    /* @__PURE__ */ jsx(
      ScrollView,
      {
        style: "interviews-scroll",
        horizontal: "true",
        "shows-scroll-indicator": "false",
        children: interviews.map((interview) => /* @__PURE__ */ jsx(
          InterviewCard,
          {
            interview,
            href: `${baseUrl}/hyperview/interviews/view/${interview.creator.slug}`
          },
          interview.id
        ))
      }
    )
  ] });
};
var Interviews_default = Interviews;
const interviewsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interviews-section",
      flexDirection: "column",
      gap: 12,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "interviews-scroll", flexDirection: "row" }),
  interviewCardStyles()
] });
export {
  Interviews_default as default,
  interviewsStyles
};
