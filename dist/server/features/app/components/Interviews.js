import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { getPublishedInterviews } from "../services.js";
import InterviewCard from "./InterviewCard.js";
import ViewAllLink from "./ViewAllLink.js";
const Interviews = async () => {
  const [error, interviews] = await getPublishedInterviews();
  if (error) return /* @__PURE__ */ jsxs("div", { children: [
    "Error: ",
    error.reason
  ] });
  if (!interviews?.length) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { id: "interviews-fragment", children: [
    /* @__PURE__ */ jsx("div", { class: "mb-6 border-t-2 border-on-surface-strong pt-3", children: /* @__PURE__ */ jsxs("div", { class: "mr-6 flex items-end justify-between", children: [
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "In Conversation", children: "Interviews" }),
      /* @__PURE__ */ jsx(ViewAllLink, { href: "/interviews" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex min-w-max items-center gap-4 pr-4", children: interviews.map((interview) => /* @__PURE__ */ jsx(
      InterviewCard,
      {
        interview,
        link: `/interviews/view/${interview.creator.slug}`
      }
    )) }) }),
    /* @__PURE__ */ jsx("div", { class: " mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/interviews", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Interviews \u2192" }) }) })
  ] });
};
var Interviews_default = Interviews;
export {
  Interviews_default as default
};
