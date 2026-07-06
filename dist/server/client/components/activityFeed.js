import Alpine from "alpinejs";
const toMessageParts = (e) => {
  switch (e.type) {
    case "book_liked":
      return {
        leadingText: "",
        trailingText: " was favourited"
      };
    case "book_wishlisted":
      return {
        leadingText: "",
        trailingText: " was added to a wishlist"
      };
    case "book_collected":
      return {
        leadingText: "",
        trailingText: " was added to a collection"
      };
    case "creator_followed":
      return {
        leadingText: "",
        trailingText: " was followed"
      };
    case "book_commented":
      return {
        leadingText: "",
        trailingText: " was commented on"
      };
  }
};
function registerActivityFeed() {
  Alpine.data("activityFeed", () => ({
    // Desktop stack
    items: [],
    // Mobile queue state
    queue: [],
    activeItem: null,
    pendingCount: 0,
    activeTimer: null,
    source: null,
    maxDesktopItems: 8,
    desktopDurationMs: 6e3,
    mobileDurationMs: 4e3,
    connect() {
      return;
    },
    showNextMobile() {
      if (this.activeItem || this.queue.length === 0) return;
      this.activeItem = this.queue.shift() ?? null;
      this.pendingCount = this.queue.length;
      if (this.activeTimer) clearTimeout(this.activeTimer);
      this.activeTimer = setTimeout(() => {
        this.activeItem = null;
        this.pendingCount = this.queue.length;
        this.showNextMobile();
      }, this.mobileDurationMs);
    },
    dismissMobile() {
      if (this.activeTimer) clearTimeout(this.activeTimer);
      this.activeItem = null;
      this.pendingCount = this.queue.length;
      this.showNextMobile();
    },
    disconnect() {
      this.source?.close();
      this.source = null;
    }
  }));
}
export {
  registerActivityFeed
};
