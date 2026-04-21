import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { getUser } from "../../../utils";
import InfoPage from "../../../pages/InfoPage";
import { getPublishedInterviews } from "../../../features/app/services";
import GridPanel from "../../../components/app/GridPanel";
import InterviewCard from "../../../features/app/components/InterviewCard";
import SectionTitle from "../../../components/app/SectionTitle";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  const [error, interviews] = await getPublishedInterviews();
  if (error) return c.html(<InfoPage errorMessage={error.reason} />);
  if (!interviews?.length)
    return c.html(<InfoPage errorMessage="No interviews found" />);

  return c.html(
    <AppLayout title="Interviews" user={user} currentPath={currentPath}>
      <Page>
        <SectionTitle>All Interviews</SectionTitle>
        <GridPanel>
          {interviews.map((interview) => (
            <InterviewCard
              interview={interview}
              link={`/interviews/${interview.creator.slug}`}
              widthClass="w-full"
            />
          ))}
        </GridPanel>
      </Page>
    </AppLayout>,
  );
});
