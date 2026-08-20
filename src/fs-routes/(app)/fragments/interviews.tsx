import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import Button from "../../../components/app/Button";
import InterviewSpread from "@/features/app/components/InterviewSpread";
import { getPublishedInterviews } from "@/features/app/services";

export const GET = createRoute(async (c) => {
  const [error, interviews] = await getPublishedInterviews();

  if (error || !interviews?.length) return c.html(<></>);

  // Lead with an interview that actually has words to quote.
  const featured =
    interviews.find((interview) => interview.answers?.q1?.trim()) ??
    interviews[0];

  const coverUrl = featured.creator.coverUrl ?? null;

  return c.html(
    <div id="interviews-fragment">
      <SectionHeader
        kicker="In Conversation"
        action={<ViewAllLink href="/interviews" />}
      >
        Interviews
      </SectionHeader>
      <InterviewSpread interview={featured} coverUrl={coverUrl} />
      <div class="mt-8 flex md:hidden justify-center">
        <a href="/interviews">
          <Button variant="solid" color="primary" width="xl">
            View All Interviews →
          </Button>
        </a>
      </div>
    </div>,
  );
});
