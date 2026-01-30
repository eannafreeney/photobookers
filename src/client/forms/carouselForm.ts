import Alpine from "alpinejs";

export function registerCarouselForm() {
  Alpine.data("carousel", (images: string[] = []) => {
    return {
      slides: images.map((image, index) => ({
        imgSrc: image,
        imgAlt: `Image ${index + 1}`,
      })),

      currentSlideIndex: 1,
      touchStartX: null,
      touchEndX: null,
      swipeThreshold: 50,
      previous() {
        if (this.currentSlideIndex > 1) {
          this.currentSlideIndex = this.currentSlideIndex - 1;
        } else {
          // If it's the first slide, go to the last slide
          this.currentSlideIndex = this.slides.length;
        }
      },
      next() {
        if (this.currentSlideIndex < this.slides.length) {
          this.currentSlideIndex = this.currentSlideIndex + 1;
        } else {
          // If it's the last slide, go to the first slide
          this.currentSlideIndex = 1;
        }
      },
      handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
      },
      handleTouchMove(event) {
        this.touchEndX = event.touches[0].clientX;
      },
      handleTouchEnd() {
        if (this.touchEndX) {
          if (this.touchStartX - this.touchEndX > this.swipeThreshold) {
            this.next();
          }
          if (this.touchStartX - this.touchEndX < -this.swipeThreshold) {
            this.previous();
          }
          this.touchStartX = null;
          this.touchEndX = null;
        }
      },
    };
  });
}
