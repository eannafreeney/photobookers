import Button from "../../../components/app/Button";
import { stars } from "../../../lib/icons";
import { getInputIcon } from "../../../utils";

type Props = {
  className?: string;
  title?: string;
  description?: string;
};

const NewsletterCard = ({
  className = "",
  title = "Join the mailing list",
  description = "Get new book picks and updates in your inbox.",
}: Props) => (
  <div
    class={`flex flex-col gap-3 rounded-radius border border-outline bg-surface p-4 ${className}`}
  >
    {stars}
    <p class="text-sm font-medium text-on-surface-strong">{title}</p>
    <p class="text-xs text-on-surface-weak">{description}</p>
    <form
      x-target="toast newsletter-form"
      {...{ "x-target.error": "toast" }}
      id="newsletter-form"
      action="/api/newsletter"
      method="post"
      class="flex flex-col gap-2 w-full"
    >
      <label class="mb-2 bg-surface-alt rounded-radius border border-outline text-on-surface-alt flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
        {getInputIcon("email")}
        <input
          type="email"
          class="w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
          name="email"
          placeholder="you@example.com"
          autocomplete="off"
        />
      </label>
      <Button variant="outline" color="inverse" width="full">
        Sign up
      </Button>
    </form>
  </div>
);

export default NewsletterCard;
