import { formatDate } from "../../../utils";
import { interviewPullQuote } from "../interviewQuote";
import type { InterviewPreview } from "./InterviewPreviewSection";

type Props = {
  interview: InterviewPreview;
};

/**
 * One interview, given the room a quote needs — the alternative was a fourth
 * horizontal strip of cards in a row of horizontal strips.
 */
const InterviewSpread = ({ interview }: Props) => {
  const link = `/interviews/view/${interview.creator.slug}`;
  const quote = interviewPullQuote(interview.answers?.q1);

  return (
    <div class="grid items-stretch gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <a href={link} class="relative block min-h-[240px] md:min-h-[380px]">
        <img
          src={interview.promoImageUrl ?? ""}
          alt={`Interview with ${interview.creator.displayName}`}
          class="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </a>

      <figure class="flex flex-col justify-center gap-5 bg-surface-alt px-6 py-8 sm:px-10 md:py-12">
        {quote ? (
          <blockquote class="font-display text-xl font-medium leading-snug text-on-surface-strong text-balance sm:text-2xl md:text-3xl">
            <span aria-hidden="true">“</span>
            {quote}
            <span aria-hidden="true">”</span>
          </blockquote>
        ) : (
          <p class="font-display text-2xl font-medium leading-snug text-on-surface-strong md:text-3xl">
            In conversation with {interview.creator.displayName}
          </p>
        )}

        <figcaption class="flex flex-col gap-1">
          <a
            href={`/creators/${interview.creator.slug}`}
            class="text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent transition-colors"
          >
            {interview.creator.displayName}
          </a>
          {interview.completedAt ? (
            <span class="kicker text-on-surface-weak">
              {formatDate(interview.completedAt)}
            </span>
          ) : null}
        </figcaption>

        <a
          href={link}
          class="kicker group inline-flex items-center text-accent transition-colors hover:text-on-surface-strong"
        >
          Read the full interview
          <span class="w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-4 group-hover:opacity-100">
            &nbsp;→
          </span>
        </a>
      </figure>
    </div>
  );
};

export default InterviewSpread;
