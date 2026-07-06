import Alpine from "alpinejs";
function registerAlert() {
  Alpine.data("alert", () => ({
    show: false,
    init() {
      this.$nextTick(() => this.show = true);
      setTimeout(() => this.dismiss(), 6e3);
    },
    dismiss() {
      this.show = false;
      setTimeout(() => this.$root.remove(), 500);
    }
  }));
}
export {
  registerAlert
};
