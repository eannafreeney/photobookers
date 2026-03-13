import Alpine from "alpinejs";

export function registerImageOrientation() {
  Alpine.data("imageOrientation", () => ({
    loaded: false,
    imageAspectRatio: null as string | null,
    isLandscape: false,
    isSquare: false,
    coverSquare: false,
    aspectSquare: false,
    objectCover: false,

    init() {
      const img = this.$el.querySelector("img");
      if (!img) return;

      this.coverSquare = this.$el.dataset.coverSquare === "true";
      this.aspectSquare = this.$el.dataset.aspectSquare === "true";
      this.objectCover = this.$el.dataset.objectCover === "true";
      (this as { img?: HTMLImageElement }).img = img;

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

      const onImageLoad = () => {
        setOrientation();
        this.loaded = true;
        if (
          !this.aspectSquare &&
          img.naturalWidth > 0 &&
          img.naturalHeight > 0
        ) {
          this.imageAspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        }
      };

      img.addEventListener("load", onImageLoad);

      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        onImageLoad();
      }
    },

    onImageLoad() {
      const img = (this as { img?: HTMLImageElement }).img;
      if (!img) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w > 0 && h > 0) {
        this.isLandscape = w > h;
        this.isSquare = w === h;
      }
      this.loaded = true;
      if (!this.aspectSquare && w > 0 && h > 0) {
        this.imageAspectRatio = `${w} / ${h}`;
      }
    },

    get objectFitClass(): string {
      const useCover: boolean =
        this.isLandscape || (this.coverSquare && this.isSquare);
      return useCover ? "object-cover" : "object-contain";
    },
  }));
}
