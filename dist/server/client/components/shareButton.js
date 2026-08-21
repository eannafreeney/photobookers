import Alpine from "alpinejs";
import {
  nativeSharePayload,
  resolveShareUrl,
  shouldUseRichNativeShare
} from "../../lib/share.js";
async function shareImageFile(imageUrl) {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    const extension = blob.type.split("/")[1]?.split("+")[0] || "webp";
    return new File([blob], `share.${extension}`, {
      type: blob.type
    });
  } catch {
    return null;
  }
}
function richNativeShareEnabled() {
  const nav = navigator;
  return shouldUseRichNativeShare({
    mobile: nav.userAgentData?.mobile,
    userAgent: navigator.userAgent
  });
}
function registerShareButton() {
  Alpine.data("shareButton", (config = {}) => ({
    async share() {
      const url = resolveShareUrl(config.url, window.location.origin);
      const title = config.title?.trim() || document.title;
      const text = config.text?.trim() || `Check out ${title}`;
      const imageUrl = config.imageUrl?.trim();
      if (navigator.share) {
        try {
          if (richNativeShareEnabled()) {
            const payload = nativeSharePayload(title, text, url);
            if (imageUrl) {
              const file = await shareImageFile(
                resolveShareUrl(imageUrl, window.location.origin)
              );
              if (file && navigator.canShare?.({ files: [file] })) {
                await navigator.share({ ...payload, files: [file] });
                return;
              }
            }
            await navigator.share(payload);
            return;
          }
          await navigator.share({ url });
          return;
        } catch {
        }
      }
      await navigator.clipboard.writeText(url);
    }
  }));
}
export {
  registerShareButton
};
