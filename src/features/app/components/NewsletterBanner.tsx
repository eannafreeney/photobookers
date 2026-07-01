import Button from "../../../components/app/Button";
import { NEWSLETTER_COPY } from "../../../constants/newsletter";

const NewsletterBanner = () => {
  return (
    <div
      class="hidden md:block"
      x-data="{ showBanner: $persist(true).as('newsletter-banner'), dismiss() { this.showBanner = false } }"
    >
      <div
        x-show="showBanner"
        x-transition:leave="transition ease-in duration-300"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="relative flex min-h-12 items-center bg-on-surface-strong py-3 text-surface"
      >
        <div class="mx-auto flex items-center justify-center gap-4 px-6">
          <p class="text-sm text-pretty">
            <span class="kicker text-[#d9a59a] mr-2 hidden sm:inline">
              {NEWSLETTER_COPY.kicker}
            </span>
            {NEWSLETTER_COPY.banner}
          </p>
          <a href="/newsletter" class="inline-block">
            <Button variant="solid" color="accent" width="auto">
              {NEWSLETTER_COPY.cta}
            </Button>
          </a>
          <button
            type="button"
            x-on:click="dismiss()"
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
