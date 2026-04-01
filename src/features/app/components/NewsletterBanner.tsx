import Button from "../../../components/app/Button";
import { fadeTransition } from "../../../lib/transitions";

const NewsletterBanner = () => {
  return (
    <div
      x-cloak
      x-init="console.log('banner alpine init')"
      x-data="{ showBanner: $persist(true).as('newsletter-banner'), dismiss() { this.showBanner = false } }"
    >
      <div
        x-show="showBanner"
        {...fadeTransition}
        class="relative flex border-outline bg-surface-alt pt-4 md:pt-2 pb-2 text-on-surface border-b"
      >
        <div class="mx-auto flex items-center justify-center gap-4 px-6">
          <p class="text-sm text-pretty">
            Discover new books and creators directly in your inbox
          </p>
          <a href="/api/newsletter" x-target="modal-root" class="inline-block">
            <Button variant="solid" color="warning">
              Sign Up
            </Button>
          </a>
          <button
            type="button"
            {...{
              "x-on:click": "dismiss()",
            }}
            class="cursor-pointer hover:opacity-75"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterBanner;
