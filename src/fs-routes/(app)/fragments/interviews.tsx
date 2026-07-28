import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import Button from "../../../components/app/Button";
import InterviewCard from "@/features/app/components/InterviewCard";
import { getPublishedInterviews } from "@/features/app/services";

export const GET = createRoute(async (c) => {
  const [error, interviews] = await getPublishedInterviews();

  if (error || !interviews?.length) return c.html(<></>);

  return c.html(
    <div id="interviews-fragment">
      <div class="mb-6 border-t-2 border-on-surface-strong pt-3">
        <div class="mr-6 flex items-end justify-between">
          <SectionTitle className="mb-0" kicker="In Conversation">
            Interviews
          </SectionTitle>
          <ViewAllLink href="/interviews" />
        </div>
      </div>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex min-w-max items-center gap-4 pr-4">
          {interviews.map((interview) => (
            <InterviewCard
              interview={interview}
              link={`/interviews/view/${interview.creator.slug}`}
            />
          ))}
        </div>
      </div>
      <div class=" mt-8 flex md:hidden justify-center">
        <a href="/interviews">
          <Button variant="solid" color="primary" width="xl">
            View All Interviews →
          </Button>
        </a>
      </div>
    </div>,
  );
});
