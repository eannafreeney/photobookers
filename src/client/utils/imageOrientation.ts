import Alpine from "alpinejs";

export function registerImageOrientation() {
  Alpine.data("imageOrientation", () => ({
    isLandscape: false,
    isSquare: false,

    init() {
      const img = this.$el.querySelector("img");
      if (!img) return;

      this.coverSquare = this.$el.dataset.coverSquare === "true";

      const setOrientation = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w > 0 && h > 0) {
          this.isLandscape = w > h;
          this.isSquare = w === h;
        } else {
          this.isLandscape = false;
          this.isSquare = false;
        }
      };

      // Always listen for load so we get dimensions when src is set later
      img.addEventListener("load", setOrientation);

      // If the image already has dimensions (e.g. cached or src was set before init), set now
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setOrientation();
      }
    },
    get objectFitClass() {
      const useCover = this.isLandscape || (this.coverSquare && this.isSquare);
      return useCover ? "object-cover" : "object-contain";
    },
  }));
}
