import Button from "../../../components/app/Button";
import { getInputIcon } from "../../../utils";
import clsx from "clsx";

const NewsletterForm = ({ className }: { className?: string }) => (
  <form
    id="newsletter-form"
    x-target="toast"
    {...{ "x-target.error": "toast", "@ajax:after": "$el.reset()" }}
    action="/api/newsletter"
    method="post"
    class={clsx("flex w-full min-w-0 items-center gap-2", className)}
  >
    <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-radius border border-outline bg-surface px-3 font-semibold text-on-surface-alt shadow-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
      <span class="shrink-0">{getInputIcon("email")}</span>
      <input
        type="email"
        class="min-w-0 flex-1 text-base bg-surface leading-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
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

export default NewsletterForm;
