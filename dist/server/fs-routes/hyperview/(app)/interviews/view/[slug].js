import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getInterviewByCreatorSlug } from "../../../../../features/app/services.js";
import { slugSchema } from "../../../../../features/app/schema.js";
import { paramValidator } from "../../../../../lib/validator.js";
import { AppLayout } from "../../../+layout.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { View } from "../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { getUser } from "../../../../../utils.js";
import InterviewViewBody, {
  interviewViewStyles
} from "../../../../../features/hyperview/components/InterviewViewBody.js";
import { interviewCardStyles } from "../../../../../features/hyperview/components/InterviewCard.js";
import { signInEmptyHintStyles } from "../../../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ErrorScreen from "../../../../../features/hyperview/components/ErrorScreen.js";
const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  if (!interview) {
    return hv(
      /* @__PURE__ */ jsx(
        ErrorScreen,
        {
          user,
          baseUrl,
          message: "Interview not found."
        }
      )
    );
  }
  const book = interview.creator.type === "artist" ? interview.creator.booksAsArtist[0] : interview.creator.booksAsPublisher[0];
  if (!book) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Book not found." })
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: interview.creator.displayName,
        user,
        baseUrl,
        fixedHeader: true,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: /* @__PURE__ */ jsx(
          InterviewViewBody,
          {
            interview,
            book,
            baseUrl
          }
        ) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  interviewCardStyles(),
  interviewViewStyles()
] });
export {
  GET
};
