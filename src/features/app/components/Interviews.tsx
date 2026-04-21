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
      <div class="flex items-center justify-between">
        <SectionTitle>Interviews</SectionTitle>
        <ViewAllLink href="/interviews" />
      </div>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex min-w-max items-center gap-4 pr-4">
          {interviews.map((interview) => (
            <InterviewCard
              interview={interview}
              link={`/interviews/${interview.creator.slug}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Interviews;
