import SectionTitle from "../../../components/app/SectionTitle";
import { formatDate } from "../../../utils";
import { getPublishedInterviews } from "../services";
import InterviewCard from "./InterviewCard";

const Interviews = async () => {
  const [error, interviews] = await getPublishedInterviews();

  if (error) return <div>Error: {error.reason}</div>;
  if (!interviews?.length) return <></>;

  return (
    <>
      <SectionTitle>Interviews</SectionTitle>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex min-w-max items-center gap-4 pr-4">
          {interviews.map((interview) => (
            <a
              href={`/interviews/${interview.creator.slug}`}
              class="cursor-pointer"
            >
              <InterviewCard interview={interview} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Interviews;
