import Alpine from "alpinejs";

export function registerShareButton() {
  Alpine.data("shareButton", () => ({
    async share() {
      const url = window.location.href;
      const title = document.title;
      const text = `Check out ${title}`;

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch (err) {
          // User cancelled or error occurred
          console.log("Share cancelled");
        }
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        // Show toast notification
        console.log("Link copied to clipboard!");
        //   this.showToast("Link copied to clipboard!");
      }
    },
  }));
}
