import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getPublishedInterviews } from "../../../features/app/services.js";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import InterviewCard, {
  interviewCardStyles
} from "../../../features/hyperview/components/InterviewCard.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  const [error, interviews] = await getPublishedInterviews();
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  if (!interviews?.length) {
    return hv(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Interviews",
          user,
          showDock: true,
          baseUrl,
          extraStyles: pageStyles(),
          children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No interviews found." }) })
        }
      )
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Interviews",
        user,
        showDock: true,
        baseUrl,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsxs(View, { style: "page-content", children: [
          /* @__PURE__ */ jsx(Text, { style: "interviews-page-title", children: "All Interviews" }),
          interviews.map((interview) => /* @__PURE__ */ jsx(
            InterviewCard,
            {
              interview,
              variant: "list",
              href: `${baseUrl}/hyperview/interviews/view/${interview.creator.slug}`
            },
            interview.id
          ))
        ] })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  interviewCardStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interviews-page-title",
      fontSize: 20,
      fontWeight: "700",
      color: "#191613",
      marginBottom: 16
    }
  )
] });
export {
  GET
};
