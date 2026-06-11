import SectionTitle from "../../../components/app/SectionTitle";
import { getPublishedInterviews } from "../services";
import InterviewCard from "./InterviewCard";
import ViewAllLink from "./ViewAllLink";

const Interviews = async () => {
  const [error, interviews] = await getPublishedInterviews();

  if (error) return <div>Error: {error.reason}</div>;
  if (!interviews?.length) return <></>;

  return (
    <>
      <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
        <SectionTitle className="mb-0" kicker="In Conversation">
          Interviews
        </SectionTitle>
        <ViewAllLink href="/interviews" />
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
    </>
  );
};

export default Interviews;
