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
        this.isLandscape = w > h;
        this.isSquare = w === h;
      };

      if (img.complete) {
        setOrientation();
      } else {
        img.addEventListener("load", setOrientation);
      }
    },
  }));
}
