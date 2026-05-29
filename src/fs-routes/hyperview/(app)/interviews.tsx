import { createRoute } from "hono-fsr";
import { getPublishedInterviews } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import InterviewCard, {
  interviewCardStyles,
} from "../../../features/hyperview/components/InterviewCard";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  const [error, interviews] = await getPublishedInterviews();

  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  if (!interviews?.length) {
    return hv(
      <AppLayout
        title="Interviews"
        user={user}
        showDock
        baseUrl={baseUrl}
        extraStyles={pageStyles()}
      >
        <View style="page-content">
          <Text style="featured-empty-hint">No interviews found.</Text>
        </View>
      </AppLayout>,
    );
  }

  return hv(
    <AppLayout
      title="Interviews"
      user={user}
      showDock
      baseUrl={baseUrl}
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        <Text style="interviews-page-title">All Interviews</Text>
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            variant="list"
            href={`${baseUrl}/hyperview/interviews/view/${interview.creator.slug}`}
          />
        ))}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {interviewCardStyles()}
    <Style
      id="interviews-page-title"
      fontSize={20}
      fontWeight="700"
      color="#111111"
      marginBottom={16}
    />
  </>
);
