import Button from "../../../components/app/Button";
import { fadeTransition } from "../../../lib/transitions";
import { SITE_APP } from "../../../constants/siteSocial";

const AppStoreBanner = () => {
  return (
    <div
      x-cloak
      x-data="{
        showBanner: $persist(true).as('app-store-banner'),
        isIos: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        dismiss() { this.showBanner = false }
      }"
      x-show="showBanner && isIos"
    >
      <div
        {...fadeTransition}
        class="relative flex bg-surface-alt border-b border-outline pt-3 pb-3 text-on-surface-strong md:hidden"
      >
        <div class="mx-auto flex items-center justify-center gap-4 px-6">
          <p class="text-sm text-pretty">
            <span class="kicker text-accent mr-2">App</span>
            Browse photobooks on the go
          </p>
          <a
            href={SITE_APP.ios.href}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block"
          >
            <Button variant="solid" color="primary" width="auto">
              Get the app
            </Button>
          </a>
          <button
            type="button"
            x-on:click="dismiss()"
            class="cursor-pointer hover:opacity-75"
            aria-label="Dismiss app banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppStoreBanner;
