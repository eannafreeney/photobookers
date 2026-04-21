import SectionTitle from "../../../components/app/SectionTitle";
import { formatDate } from "../../../utils";
import { getPublishedInterviews } from "../services";

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
            <InterviewCard interview={interview} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Interviews;

type InterviewCardData = {
  id: string;
  promoImageUrl: string | null;
  creator: {
    slug: string;
    displayName: string;
  };
  completedAt: Date | null;
};

const InterviewCard = ({ interview }: { interview: InterviewCardData }) => (
  <div class="relative rounded-radius overflow-hidden shrink-0 w-[78vw] sm:w-[calc((100%-2rem)/3.3)]">
    <a href={`/interviews/${interview.creator.slug}`} class="cursor-pointer">
      <img
        src={interview.promoImageUrl ?? ""}
        class="w-full h-64 object-cover rounded-radius"
        alt="Interview"
      />
      <div class="absolute inset-0 flex flex-col gap-1 items-center justify-center rounded-radius bg-black/50 hover:bg-transparent transition-all duration-300 p-4 text-white">
        <h3 class="text-3xl font-medium tracking-wider text-center">
          {interview.creator.displayName}
        </h3>
        <p class="text-xs text-center text-base-content/60 tracking-wide">
          {interview.completedAt ? formatDate(interview.completedAt) : "-"}
        </p>
      </div>
    </a>
  </div>
);
