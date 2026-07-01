const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

let loadPromise: Promise<void> | null = null;

export function registerTurnstileHandlers(): void {
  if (
    (window as typeof window & { __turnstileHandlersRegistered?: boolean })
      .__turnstileHandlersRegistered
  ) {
    return;
  }
  (
    window as typeof window & { __turnstileHandlersRegistered?: boolean }
  ).__turnstileHandlersRegistered = true;

  (
    window as typeof window & { onTurnstileSuccess?: (token: string) => void }
  ).onTurnstileSuccess = (token: string) => {
    window.dispatchEvent(
      new CustomEvent("turnstile:success", { detail: { token } }),
    );
  };

  (
    window as typeof window & { onTurnstileExpired?: () => void }
  ).onTurnstileExpired = () => {
    window.dispatchEvent(new CustomEvent("turnstile:expired"));
  };
}

/** Load Turnstile only when a captcha widget is on the page (forms/modals). */
export function ensureTurnstileScript(): Promise<void> {
  registerTurnstileHandlers();

  if ((window as typeof window & { turnstile?: unknown }).turnstile) {
    return Promise.resolve();
  }

  loadPromise ??= new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${TURNSTILE_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
