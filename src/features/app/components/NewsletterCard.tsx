import { mailIcon } from "../../../lib/icons";
import NewsletterForm from "./NewsletterForm";
import { NEWSLETTER_COPY } from "../../../constants/newsletter";
import {
  getNewsletterSubscriberCount,
  newsletterSubscriberLabel,
} from "../../../domain/newsletters/subscribers";
import { toWeekStart } from "../../../lib/utils";
import { thisWeekPath } from "../spotlightUrls";

/** Last week's picks page — the same contents the last issue carried. */
const lastIssuePath = () => {
  const lastWeek = toWeekStart(new Date());
  lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
  return thisWeekPath(lastWeek);
};

const NewsletterCard = async () => {
  const subscriberLabel = newsletterSubscriberLabel(
    await getNewsletterSubscriberCount(),
  );

  return (
    <div
      id="newsletter-card"
      class="overflow-hidden border-t-2 border-on-surface-strong bg-surface-alt p-5 sm:p-6"
    >
      <div class="flex flex-col 2xl:flex-row gap-4 md:items-center md:gap-6">
        <div class="flex flex-col md:flex-row min-w-0 items-start gap-4 md:flex-1">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-accent border border-outline sm:size-11">
            {mailIcon(5)}
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="kicker text-accent">{NEWSLETTER_COPY.kicker}</span>
              {subscriberLabel ? (
                <span class="kicker text-on-surface-weak">
                  {subscriberLabel}
                </span>
              ) : null}
            </div>
            <p class="mt-1 font-display text-xl text-on-surface-strong">
              {NEWSLETTER_COPY.title}
            </p>
            <p class="mt-1 text-pretty text-xs leading-relaxed text-on-surface sm:text-sm">
              {NEWSLETTER_COPY.banner}
            </p>
            <a
              href={lastIssuePath()}
              class="mt-2 inline-block text-xs underline decoration-accent underline-offset-4 transition-colors hover:text-on-surface-strong sm:text-sm"
            >
              See what was in last week's issue →
            </a>
          </div>
        </div>
        <NewsletterForm className="w-full max-w-md" />
      </div>
    </div>
  );
};

export default NewsletterCard;
