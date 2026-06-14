import Alpine from "alpinejs";
import { resolveShareUrl } from "../../lib/share";

type ShareConfig = {
  title?: string;
  text?: string;
  url?: string;
};

export function registerShareButton() {
  Alpine.data("shareButton", (config: ShareConfig = {}) => ({
    async share() {
      const url = resolveShareUrl(config.url, window.location.origin);
      const title = config.title?.trim() || document.title;
      const text = config.text?.trim() || `Check out ${title}`;

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch {
          // User cancelled or error occurred
        }
      } else {
        const clipboardText =
          text === `Check out ${title}` ? url : `${text}\n${url}`;
        await navigator.clipboard.writeText(clipboardText);
      }
    },
  }));
}
