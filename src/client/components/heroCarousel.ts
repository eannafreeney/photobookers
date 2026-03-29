import Alpine from "alpinejs";

export type HeroCarouselItem = {
  label: string;
  title: string;
  creator: string;
  image?: string;
  coverStack?: string[];
  slideClass?: string;
  link: string;
};

export function registerHeroCarousel() {
  Alpine.data("heroCarousel", (items: HeroCarouselItem[] = []) => {
    return {
      active: 0,
      interval: null as ReturnType<typeof setInterval> | null,

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
    };
  });
}
