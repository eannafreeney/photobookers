import Alpine from "alpinejs";
import { resolveShareUrl } from "../../lib/share.js";
function registerShareButton() {
  Alpine.data("shareButton", (config = {}) => ({
    async share() {
      const url = resolveShareUrl(config.url, window.location.origin);
      const title = config.title?.trim() || document.title;
      const text = config.text?.trim() || `Check out ${title}`;
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch {
        }
      } else {
        const clipboardText = text === `Check out ${title}` ? url : `${text}
${url}`;
        await navigator.clipboard.writeText(clipboardText);
      }
    }
  }));
}
export {
  registerShareButton
};
