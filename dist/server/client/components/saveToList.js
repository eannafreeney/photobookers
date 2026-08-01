import Alpine from "alpinejs";
function registerSaveToList() {
  Alpine.data("saveToList", () => ({
    open: false,
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    }
  }));
}
export {
  registerSaveToList
};
