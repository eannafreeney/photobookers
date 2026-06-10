import SectionTitle from "../../../components/app/SectionTitle";
import InterviewCard from "./InterviewCard";

export type InterviewPreview = {
  id: string;
  promoImageUrl: string | null;
  completedAt: Date | null;
  answers?: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
  } | null;
  creator: { slug: string; displayName: string };
};

type Props = {
  interview: InterviewPreview;
  widthClass?: string;
};

const InterviewPreviewSection = ({
  interview,
  widthClass = "w-full max-w-2xl",
}: Props) => {
  const interviewUrl = `/interviews/view/${interview.creator.slug}`;
  const teaser = interview.answers?.q1?.trim();

  return (
    <section class="flex flex-col gap-4">
      <SectionTitle>Interview</SectionTitle>
      {interview.promoImageUrl ? (
        <InterviewCard
          interview={interview}
          widthClass={widthClass}
          link={interviewUrl}
        />
      ) : null}
      {teaser ? (
        <p class="text-pretty text-sm text-on-surface whitespace-pre-wrap line-clamp-6">
          {teaser}
        </p>
      ) : null}
      <p class="text-sm">
        <a href={interviewUrl} class="underline">
          Read the full interview with {interview.creator.displayName}
        </a>
      </p>
    </section>
  );
};

export default InterviewPreviewSection;
