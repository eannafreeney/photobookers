import { createRoute } from "hono-fsr";
import { getInterviewByCreatorSlug } from "../../../../../features/app/services";
import { slugSchema } from "../../../../../features/app/schema";
import { paramValidator } from "../../../../../lib/validator";
import { AppLayout } from "../../../+layout";
import { hyperview } from "../../../../../lib/hxml";
import { View } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";
import InterviewViewBody, {
  interviewViewStyles,
} from "../../../../../features/hyperview/components/InterviewViewBody";
import { interviewCardStyles } from "../../../../../features/hyperview/components/InterviewCard";
import { signInEmptyHintStyles } from "../../../../../features/hyperview/hyperviewCommonScreenStyles";
import ErrorScreen from "../../../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  const [error, interview] = await getInterviewByCreatorSlug(slug);

  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  if (!interview) {
    return hv(
      <ErrorScreen
        user={user}
        baseUrl={baseUrl}
        message="Interview not found."
      />,
    );
  }

  const book =
    interview.creator.type === "artist"
      ? interview.creator.booksAsArtist[0]
      : interview.creator.booksAsPublisher[0];

  if (!book) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Book not found." />,
    );
  }

  return hv(
    <AppLayout
      title={interview.creator.displayName}
      user={user}
      baseUrl={baseUrl}
      fixedHeader
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        <InterviewViewBody
          interview={interview}
          book={book}
          baseUrl={baseUrl}
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {interviewCardStyles()}
    {interviewViewStyles()}
  </>
);
