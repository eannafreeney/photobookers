import Alpine from "alpinejs";
import {
  nativeSharePayload,
  resolveShareUrl,
  shouldUseRichNativeShare,
} from "../../lib/share";

type ShareConfig = {
  title?: string;
  text?: string;
  url?: string;
  /** Absolute or same-origin image URL for native share previews. */
  imageUrl?: string;
};

async function shareImageFile(imageUrl: string): Promise<File | null> {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    const extension = blob.type.split("/")[1]?.split("+")[0] || "webp";
    return new File([blob], `share.${extension}`, {
      type: blob.type,
    });
  } catch {
    return null;
  }
}

function richNativeShareEnabled(): boolean {
  const nav = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };
  return shouldUseRichNativeShare({
    mobile: nav.userAgentData?.mobile,
    userAgent: navigator.userAgent,
  });
}

export function registerShareButton() {
  Alpine.data("shareButton", (config: ShareConfig = {}) => ({
    async share() {
      const url = resolveShareUrl(config.url, window.location.origin);
      const title = config.title?.trim() || document.title;
      const text = config.text?.trim() || `Check out ${title}`;
      const imageUrl = config.imageUrl?.trim();

      if (navigator.share) {
        try {
          if (richNativeShareEnabled()) {
            const payload = nativeSharePayload(title, text, url);
            // Prefer attaching the image so the system share sheet shows a preview.
            // Many browsers reject { files, url } together — link stays in text.
            if (imageUrl) {
              const file = await shareImageFile(
                resolveShareUrl(imageUrl, window.location.origin),
              );
              if (file && navigator.canShare?.({ files: [file] })) {
                await navigator.share({ ...payload, files: [file] });
                return;
              }
            }

            await navigator.share(payload);
            return;
          }

          // Desktop: URL only so share-sheet Copy stays a clean link.
          await navigator.share({ url });
          return;
        } catch {
          // Cancelled or unavailable — fall through to copy the URL.
        }
      }

      // Always copy the bare URL so pasting into a browser/address bar works.
      await navigator.clipboard.writeText(url);
    },
  }));
}
