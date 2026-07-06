import Alpine from "alpinejs";
function registerCarouselForm() {
  Alpine.data("carouselForm", (images = []) => {
    return {
      autoplayIntervalTime: 4e3,
      isFirstImageLoaded: false,
      slides: images.map((image, index) => ({
        imgSrc: image,
        imgAlt: `Image ${index + 1}`
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
          this.currentSlideIndex = this.slides.length;
        }
      },
      next() {
        if (this.currentSlideIndex < this.slides.length) {
          this.currentSlideIndex = this.currentSlideIndex + 1;
        } else {
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
      setAutoplayInterval(newIntervalTime) {
        if (this.autoplayInterval !== null) {
          clearInterval(this.autoplayInterval);
        }
        this.autoplayIntervalTime = newIntervalTime;
        this.autoplay();
      },
      handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.isPaused = true;
      },
      handleTouchMove(event) {
        this.touchEndX = event.touches[0].clientX;
        this.isPaused = true;
      },
      handleTouchEnd() {
        if (this.touchEndX != null && this.touchStartX != null) {
          if (this.touchStartX - this.touchEndX > this.swipeThreshold) {
            this.next();
          }
          if (this.touchStartX - this.touchEndX < -this.swipeThreshold) {
            this.previous();
          }
          this.touchStartX = null;
          this.touchEndX = null;
        }
        setTimeout(() => {
          this.isPaused = false;
        }, 800);
      }
    };
  });
}
export {
  registerCarouselForm
};
