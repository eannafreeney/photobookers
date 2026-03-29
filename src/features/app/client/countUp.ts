import Alpine from "alpinejs";

export function registerCountUp() {
  Alpine.data("countUp", (target: number) => {
    console.log("target", target);
    return {
      target: target,
      display: 0,
      duration: 1000, // ms
      startTime: null as number | null,

      start() {
        requestAnimationFrame(this.step.bind(this));
      },

      step(timestamp: number) {
        if (!this.startTime) this.startTime = timestamp;

        const progress = timestamp - this.startTime;
        const t = Math.min(progress / this.duration, 1);
        const percent = 1 - Math.pow(1 - t, 4.5);

        this.display = Math.floor(percent * this.target);

        if (percent < 1) {
          requestAnimationFrame(this.step.bind(this));
        } else {
          this.display = this.target;
        }
      },
    };
  });
}
