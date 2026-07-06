import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import { getUser } from "../../../utils.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getPublishedInterviews } from "../../../features/app/services.js";
import GridPanel from "../../../components/app/GridPanel.js";
import InterviewCard from "../../../features/app/components/InterviewCard.js";
import PageHeader from "../../../components/app/PageHeader.js";
import { canonicalUrl, pageTitle } from "../../../lib/seo.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const [error, interviews] = await getPublishedInterviews();
  if (error) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason }));
  if (!interviews?.length)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "No interviews found" }));
  const title = pageTitle("Interviews");
  const description = "Read interviews with photobook artists and publishers on photobookers.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/interviews"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "In Conversation",
              title: "Interviews",
              intro: "Conversations with the artists and publishers shaping the photobook world."
            }
          ),
          /* @__PURE__ */ jsx(GridPanel, { children: interviews.map((interview) => /* @__PURE__ */ jsx(
            InterviewCard,
            {
              interview,
              link: `/interviews/${interview.creator.slug}`,
              widthClass: "w-full"
            }
          )) })
        ] })
      }
    )
  );
});
export {
  GET
};
