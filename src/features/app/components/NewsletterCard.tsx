import clsx from "clsx";
import Button from "../../../components/app/Button";
import { mailIcon } from "../../../lib/icons";
import { getInputIcon } from "../../../utils";

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

      <NewsletterForm className="w-full md:w-auto md:min-w-[17rem] md:max-w-sm" />
    </div>
  </div>
);

export default NewsletterCard;

const NewsletterForm = ({ className }: { className?: string }) => (
  <form
    x-target="toast newsletter-form"
    {...{ "x-target.error": "toast" }}
    id="newsletter-form"
    action="/api/newsletter"
    method="post"
    class={clsx("flex w-full min-w-0 items-center gap-2", className)}
  >
    <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-radius border border-outline bg-surface px-3 font-semibold text-on-surface-alt shadow-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
      <span class="shrink-0">{getInputIcon("email")}</span>
      <input
        type="email"
        class="min-w-0 flex-1 bg-surface text-sm leading-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
        name="email"
        placeholder="you@example.com"
        autocomplete="email"
        required
      />
    </label>
    <div class="h-10 shrink-0 [&>button]:h-full [&>button]:px-4">
      <Button variant="solid" color="primary" width="auto">
        Sign up
      </Button>
    </div>
  </form>
);
