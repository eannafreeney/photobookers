import Alpine from "alpinejs";

export function registerImageOrientation() {
  Alpine.data("imageOrientation", () => ({
    isLandscape: false,

    init() {
      const img = this.$el.querySelector('img');
      if (!img) return;

      if (img.complete) {
        this.isLandscape = img.naturalWidth > img.naturalHeight;
      } else {
        img.addEventListener('load', () => {
          this.isLandscape = img.naturalWidth > img.naturalHeight;
        });
      }
    },
  }));
}