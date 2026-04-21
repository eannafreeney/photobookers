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
      <div class="absolute inset-0 flex flex-col gap-1 items-center justify-center rounded-radius bg-black/50 hover:bg-transparent transition-all duration-300 p-4 text-white">
        <p class="text-xs text-center text-base-content/60 tracking-wide">
          Interview
        </p>
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

export default InterviewCard;
