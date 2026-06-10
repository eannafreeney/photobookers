import Alpine from "alpinejs";

export function registerHorizontalScrollGallery() {
  Alpine.data("horizontalScrollGallery", () => ({
    init() {
      this.$el.addEventListener(
        "wheel",
        (event: WheelEvent) => {
          const isVerticalIntent =
            Math.abs(event.deltaY) > Math.abs(event.deltaX);

          if (!isVerticalIntent) return;

          event.preventDefault();
          window.scrollBy({
            top: event.deltaY,
            left: 0,
            behavior: "auto",
          });
        },
        { passive: false },
      );
    },
  }));
}
