import Button from "../../../components/app/Button";
import { fadeTransition } from "../../../lib/transitions";

const NewsletterBanner = () => {
  return (
    <div
      x-cloak
      x-data="{ showBanner: $persist(true).as('newsletter-banner'), dismiss() { this.showBanner = false } }"
    >
      <div
        x-show="showBanner"
        {...fadeTransition}
        class="relative flex bg-on-surface-strong pt-3 pb-3 text-surface"
      >
        <div class="mx-auto flex items-center justify-center gap-4 px-6">
          <p class="text-sm text-pretty">
            <span class="kicker text-[#d9a59a] mr-2 hidden sm:inline">
              Newsletter
            </span>
            Discover new books and creators directly in your inbox
          </p>
          <a href="/newsletter" x-target="modal-root" class="inline-block">
            <Button variant="solid" color="accent" width="auto">
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
