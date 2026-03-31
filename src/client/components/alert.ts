import Alpine from "alpinejs";

export function registerAlert() {
  Alpine.data("alert", () => ({
    show: false,
    init() {
      this.$nextTick(() => (this.show = true));
      setTimeout(() => this.dismiss(), 6000);
    },
    dismiss() {
      this.show = false;
      setTimeout(() => this.$root.remove(), 500);
    },
  }));
}
