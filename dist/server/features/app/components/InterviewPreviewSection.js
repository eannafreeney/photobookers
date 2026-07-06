import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import InterviewCard from "./InterviewCard.js";
const InterviewPreviewSection = ({
  interview,
  widthClass = "w-full max-w-2xl"
}) => {
  const interviewUrl = `/interviews/view/${interview.creator.slug}`;
  const teaser = interview.answers?.q1?.trim();
  return /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-4 border-t-2 border-on-surface-strong pt-3 mt-6", children: [
    /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "In Conversation", children: "Interview" }),
    interview.promoImageUrl ? /* @__PURE__ */ jsx(
      InterviewCard,
      {
        interview,
        widthClass,
        link: interviewUrl
      }
    ) : null,
    teaser ? /* @__PURE__ */ jsx("p", { class: "text-pretty text-sm text-on-surface whitespace-pre-wrap line-clamp-6", children: teaser }) : null,
    /* @__PURE__ */ jsx("p", { class: "text-sm", children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: interviewUrl,
        class: "underline decoration-accent underline-offset-4 hover:text-accent transition-colors",
        children: [
          "Read the full interview with ",
          interview.creator.displayName
        ]
      }
    ) })
  ] });
};
var InterviewPreviewSection_default = InterviewPreviewSection;
export {
  InterviewPreviewSection_default as default
};
