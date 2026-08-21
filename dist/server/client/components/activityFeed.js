import Alpine from "alpinejs";
import {
  recentActivityVerb
} from "../../features/app/homepageRecentActivityUtils.js";
function isVisibleActivity(event, currentUserId) {
  if (currentUserId && event.actorId === currentUserId) return false;
  return Boolean(event.targetImageUrl?.trim());
}
function registerActivityFeed() {
  Alpine.data("activityFeed", () => ({
    queue: [],
    activeItem: null,
    pendingCount: 0,
    activeTimer: null,
    source: null,
    shouldReconnect: false,
    reconnectTimer: null,
    toastDurationMs: 6e3,
    verb(type) {
      return recentActivityVerb(type);
    },
    connect() {
      if (this.source) return;
      this.shouldReconnect = true;
      const currentUserId = this.$el?.dataset?.currentUserId ?? "";
      this.source = new EventSource("/api/activity/stream");
      this.source.addEventListener("activity", (message) => {
        try {
          const event = JSON.parse(message.data);
          this.pushActivity(event, currentUserId);
        } catch {
        }
      });
      this.source.addEventListener("error", () => {
        this.closeSource();
        if (!this.shouldReconnect) return;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = window.setTimeout(() => this.connect(), 5e3);
      });
    },
    pushActivity(event, currentUserId) {
      if (!isVisibleActivity(event, currentUserId)) return;
      const item = {
        ...event,
        actorName: event.actorName?.trim() || "Someone"
      };
      this.queue.push(item);
      this.pendingCount = this.queue.length;
      this.showNext();
    },
    showNext() {
      if (this.activeItem || this.queue.length === 0) return;
      this.activeItem = this.queue.shift() ?? null;
      this.pendingCount = this.queue.length;
      if (this.activeTimer) clearTimeout(this.activeTimer);
      this.activeTimer = setTimeout(() => {
        this.activeItem = null;
        this.pendingCount = this.queue.length;
        this.showNext();
      }, this.toastDurationMs);
    },
    dismissActive() {
      if (this.activeTimer) clearTimeout(this.activeTimer);
      this.activeItem = null;
      this.pendingCount = this.queue.length;
      this.showNext();
    },
    closeSource() {
      this.source?.close();
      this.source = null;
    },
    disconnect() {
      this.shouldReconnect = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.closeSource();
    }
  }));
}
export {
  registerActivityFeed
};
