import Alpine from "alpinejs";

export function registerImageOrientation() {
  Alpine.data("imageOrientation", () => ({
    isLandscape: false,
    isSquare: false,

    init() {
      const img = this.$el.querySelector("img");
      if (!img) return;

      const setOrientation = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        console.log("w", w, "h", h);
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

      // if (img.complete) {
      //   setOrientation();
      // } else {
      //   img.addEventListener("load", setOrientation);
      // }
    },
  }));
}
