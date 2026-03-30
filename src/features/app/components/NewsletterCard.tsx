import Button from "../../../components/app/Button";
import { mailIcon } from "../../../lib/icons";
import { getInputIcon } from "../../../utils";

const NewsletterCard = () => (
  <div class="rounded-radius mx-auto bg-surface p-4 shadow-md w-1/2">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3 md:w-1/2">
        <div>{mailIcon(5)}</div>
        <div class="min-w-0 text-md font-semibold text-on-surface-strong">
          Join the mailing list
        </div>
      </div>
      <NewsletterForm />
    </div>
  </div>
);

export default NewsletterCard;

const NewsletterForm = () => (
  <form
    x-target="toast newsletter-form"
    {...{ "x-target.error": "toast" }}
    id="newsletter-form"
    action="/api/newsletter"
    method="post"
    class="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-end"
  >
    <label class="bg-surface-alt rounded-radius border border-outline text-on-surface-alt flex items-center gap-2 px-2 py-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary w-full sm:w-auto">
      {getInputIcon("email")}
      <input
        type="email"
        class="w-full bg-surface-alt px-1 py-0.5 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
        name="email"
        placeholder="you@example.com"
        autocomplete="email"
        required
      />
    </label>
    <Button variant="outline" color="inverse" width="fit">
      Sign up
    </Button>
  </form>
);
