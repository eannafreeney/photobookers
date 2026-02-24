import Alpine from "alpinejs";

export function registerCarouselForm() {
  Alpine.data("carouselForm", (images: string[] = []) => {
    return {
      autoplayIntervalTime: 4000,

      slides: images.map((image, index) => ({
        imgSrc: image,
        imgAlt: `Image ${index + 1}`,
      })),

      currentSlideIndex: 1,
      isPaused: false,
      autoplayInterval: null,
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
      autoplay() {
        this.autoplayInterval = setInterval(() => {
          if (!this.isPaused) {
            this.next();
          }
        }, this.autoplayIntervalTime);
      },
      // Updates interval time
      setAutoplayInterval(newIntervalTime: number) {
        if (this.autoplayInterval !== null) {
          clearInterval(this.autoplayInterval);
        }
        this.autoplayIntervalTime = newIntervalTime;
        this.autoplay();
      },
      handleTouchStart(event: TouchEvent) {
        this.touchStartX = event.touches[0].clientX;
        this.isPaused = true;
      },
      handleTouchMove(event: TouchEvent) {
        this.touchEndX = event.touches[0].clientX;
        this.isPaused = true;
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
        // Resume autoplay after a short delay so the slide doesn't jump immediately
        setTimeout(() => {
          this.isPaused = false;
        }, 800);
      },
    };
  });
}
