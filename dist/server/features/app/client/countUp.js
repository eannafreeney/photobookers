import Alpine from "alpinejs";
function registerCountUp() {
  Alpine.data("countUp", (target) => {
    console.log("target", target);
    return {
      target,
      display: 0,
      duration: 1e3,
      // ms
      startTime: null,
      start() {
        requestAnimationFrame(this.step.bind(this));
      },
      step(timestamp) {
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
      }
    };
  });
}
export {
  registerCountUp
};
