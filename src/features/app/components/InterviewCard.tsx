import clsx from "clsx";
import { formatDate } from "../../../utils";

type InterviewCardData = {
  id: string;
  promoImageUrl: string | null;
  creator: { slug: string; displayName: string };
  completedAt: Date | null;
};

const InterviewCard = ({
  interview,
  widthClass = "w-[78vw] sm:w-[calc((100%-2rem)/3.3)]",
  link,
}: {
  interview: InterviewCardData;
  widthClass?: string;
  link?: string;
}) => (
  <div
    class={clsx("relative rounded-radius overflow-hidden shrink-0", widthClass)}
  >
    <a href={link} class="cursor-pointer">
      <img
        src={interview.promoImageUrl ?? ""}
        class="w-full h-64 object-cover rounded-radius"
        alt="Interview"
      />
      <div class="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-black/55 hover:bg-black/20 transition-all duration-300 p-4 text-white">
        <p class="kicker text-center text-white/70">Interview</p>
        <h3 class="font-display text-3xl font-medium text-center text-balance">
          {interview.creator.displayName}
        </h3>
        <p class="kicker text-center text-white/70">
          {interview.completedAt ? formatDate(interview.completedAt) : "-"}
        </p>
      </div>
    </a>
  </div>
);

export default InterviewCard;
