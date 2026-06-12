import { mailIcon } from "../../../lib/icons";
import NewsletterForm from "./NewsletterForm";

const NewsletterCard = () => (
  <div
    id="newsletter-card"
    class="overflow-hidden border-y-2 border-on-surface-strong bg-surface-alt p-5 sm:p-6"
  >
    <div class="flex flex-col 2xl:flex-row gap-4 md:items-center md:gap-6">
      <div class="flex min-w-0 items-start gap-4 md:flex-1">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-accent border border-outline sm:size-11">
          {mailIcon(5)}
        </div>
        <div class="min-w-0 flex-1 pt-0.5">
          <span class="kicker text-accent">Newsletter</span>
          <p class="mt-1 font-display text-xl text-on-surface-strong">
            Join the mailing list
          </p>
          <p class="mt-1 text-pretty text-xs leading-relaxed text-on-surface sm:text-sm">
            Discover new books and creators in your inbox
          </p>
        </div>
      </div>

      <NewsletterForm className="w-full md:w-auto md:min-w-68 md:max-w-sm" />
    </div>
  </div>
);

export default NewsletterCard;
