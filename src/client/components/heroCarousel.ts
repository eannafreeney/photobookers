import Alpine from "alpinejs";

export type HeroCarouselItem = {
  label: string;
  title: string;
  image?: string;
  coverStack?: string[];
  slideClass?: string;
  text?: string;
  link: string;
  weekNumber?: number | null;
};

export function registerHeroCarousel() {
  Alpine.data("heroCarousel", (items: HeroCarouselItem[] = []) => {
    return {
      active: 0,
      interval: null as ReturnType<typeof setInterval> | null,
      touchStartX: null as number | null,
      touchEndX: null as number | null,
      swipeThreshold: 50,
      isPaused: false,
      items,

      init() {
        if (this.items.length > 0) this.startAutoRotate();
      },

      go(index: number) {
        if (this.items.length === 0) return;
        this.active = index;
        this.restart();
      },

      next() {
        if (this.items.length === 0) return;
        this.active = (this.active + 1) % this.items.length;
        this.restart();
      },

      prev() {
        if (this.items.length === 0) return;
        this.active = (this.active - 1 + this.items.length) % this.items.length;
        this.restart();
      },

      pause() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      },

      resume() {
        this.startAutoRotate();
      },

      startAutoRotate() {
        if (this.items.length <= 1) return;
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
          this.next();
        }, 6000);
      },

      restart() {
        if (this.interval) clearInterval(this.interval);
        this.startAutoRotate();
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
        if (this.touchEndX != null && this.touchStartX != null) {
          if (this.touchStartX - this.touchEndX > this.swipeThreshold) {
            this.next();
          }
          if (this.touchStartX - this.touchEndX < -this.swipeThreshold) {
            this.prev();
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
