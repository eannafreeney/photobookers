import Alpine from "alpinejs";
import {
  recentActivityVerb,
  type RecentActivityType,
} from "../../features/app/homepageRecentActivityUtils";

type ActivityEvent = {
  id: string;
  type: RecentActivityType;
  actorId?: string;
  actorName?: string;
  targetName: string;
  targetImageUrl?: string | null;
  targetUrl?: string;
  targetCreatorName?: string;
  createdAt: string;
};

type ActivityItem = ActivityEvent & {
  actorName: string;
};

function isVisibleActivity(
  event: ActivityEvent,
  currentUserId: string,
): boolean {
  if (currentUserId && event.actorId === currentUserId) return false;
  return Boolean(event.targetImageUrl?.trim());
}

export function registerActivityFeed() {
  Alpine.data("activityFeed", () => ({
    queue: [] as ActivityItem[],
    activeItem: null as ActivityItem | null,
    pendingCount: 0,
    activeTimer: null as ReturnType<typeof setTimeout> | null,

    source: null as EventSource | null,
    shouldReconnect: false,
    reconnectTimer: null as number | null,

    toastDurationMs: 6000,

    verb(type: RecentActivityType) {
      return recentActivityVerb(type);
    },

    connect() {
      if (this.source) return;

      this.shouldReconnect = true;
      const currentUserId = this.$el?.dataset?.currentUserId ?? "";

      this.source = new EventSource("/api/activity/stream");

      this.source.addEventListener("activity", (message) => {
        try {
          const event = JSON.parse(message.data) as ActivityEvent;
          this.pushActivity(event, currentUserId);
        } catch {
          // ignore malformed payloads
        }
      });

      this.source.addEventListener("error", () => {
        this.closeSource();
        if (!this.shouldReconnect) return;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = window.setTimeout(() => this.connect(), 5000);
      });
    },

    pushActivity(event: ActivityEvent, currentUserId: string) {
      if (!isVisibleActivity(event, currentUserId)) return;

      const item: ActivityItem = {
        ...event,
        actorName: event.actorName?.trim() || "Someone",
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
    },
  }));
}
