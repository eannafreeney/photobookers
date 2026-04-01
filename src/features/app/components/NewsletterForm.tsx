import Button from "../../../components/app/Button";
import { getInputIcon } from "../../../utils";

const NewsletterModalForm = () => {
  const alpineAttrs = {
    "x-target": "toast newsletter-form",
    "x-target.error": "toast",
    "x-target.401": "modal-root",
    "@ajax:after": "$dispatch('dialog:close')",
  };

  return (
    <form
      action="/api/newsletter"
      method="post"
      class="flex flex-col gap-3"
      {...alpineAttrs}
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
      <Button variant="solid" color="warning" width="full">
        Sign up
      </Button>
    </form>
  );
};

export default NewsletterModalForm;
