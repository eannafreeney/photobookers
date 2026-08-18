import Button from "../../../components/app/Button";
import { fadeTransition } from "../../../lib/transitions";

/**
 * Shown after email verify (`?welcome=dashboard`) for creators who haven't
 * dismissed it. Persist key is localStorage so dismiss survives sessions.
 */
const WelcomeDashboardBanner = () => {
  return (
    <div
      x-cloak
      x-data="{
        showBanner: $persist(false).as('welcome-dashboard-banner'),
        init() {
          const params = new URLSearchParams(window.location.search);
          if (params.get('welcome') !== 'dashboard') return;
          this.showBanner = true;
          params.delete('welcome');
          const qs = params.toString();
          const next = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
          history.replaceState({}, '', next);
        },
        dismiss() { this.showBanner = false }
      }"
      x-show="showBanner"
    >
      <div
        {...fadeTransition}
        class="relative flex bg-surface-alt border-b border-outline pt-3 pb-3 text-on-surface-strong"
      >
        <div class="mx-auto flex items-center justify-center gap-4 px-6">
          <p class="text-sm text-pretty">
            <span class="kicker text-accent mr-2">Welcome</span>
            Head to your dashboard to finish your profile and add books
          </p>
          <a href="/dashboard" class="inline-block" x-on:click="dismiss()">
            <Button variant="solid" color="primary" width="auto">
              Go to dashboard
            </Button>
          </a>
          <button
            type="button"
            x-on:click="dismiss()"
            class="cursor-pointer hover:opacity-75"
            aria-label="Dismiss welcome banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboardBanner;
