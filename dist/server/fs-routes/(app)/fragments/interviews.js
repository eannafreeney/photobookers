import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import Button from "../../../components/app/Button.js";
import InterviewSpread from "../../../features/app/components/InterviewSpread.js";
import { getPublishedInterviews } from "../../../features/app/services.js";
const GET = createRoute(async (c) => {
  const [error, interviews] = await getPublishedInterviews();
  if (error || !interviews?.length) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  const featured = interviews.find((interview) => interview.answers?.q1?.trim()) ?? interviews[0];
  const coverUrl = featured.creator.coverUrl ?? null;
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "interviews-fragment", children: [
      /* @__PURE__ */ jsx(
        SectionHeader,
        {
          kicker: "In Conversation",
          action: /* @__PURE__ */ jsx(ViewAllLink, { href: "/interviews" }),
          children: "Interviews"
        }
      ),
      /* @__PURE__ */ jsx(InterviewSpread, { interview: featured, coverUrl }),
      /* @__PURE__ */ jsx("div", { class: "mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/interviews", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Interviews \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
