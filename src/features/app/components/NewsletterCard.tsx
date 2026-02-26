import Button from "../../../components/app/Button";
import { stars } from "../../../lib/icons";

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
      action="/api/newsletter"
      method="post"
      class="flex flex-col gap-2 w-full"
    >
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        disabled
        class="w-full md:w-auto min-w-0 flex-1 rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-weak focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Button variant="outline" color="inverse" width="full">
        Sign up
      </Button>
    </form>
  </div>
);

export default NewsletterCard;
