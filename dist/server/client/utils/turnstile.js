const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let loadPromise = null;
function registerTurnstileHandlers() {
  if (window.__turnstileHandlersRegistered) {
    return;
  }
  window.__turnstileHandlersRegistered = true;
  window.onTurnstileSuccess = (token) => {
    window.dispatchEvent(
      new CustomEvent("turnstile:success", { detail: { token } })
    );
  };
  window.onTurnstileExpired = () => {
    window.dispatchEvent(new CustomEvent("turnstile:expired"));
  };
}
function ensureTurnstileScript() {
  registerTurnstileHandlers();
  if (window.turnstile) {
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
export {
  ensureTurnstileScript,
  registerTurnstileHandlers
};
