import Alpine from "alpinejs";

type ActivityEvent = {
  id: string;
  type:
    | "book_favourited"
    | "book_collected"
    | "creator_followed"
    | "book_commented";
  actorId?: string;
  targetName: string;
  targetImageUrl?: string | null;
  targetUrl?: string;
  targetCreatorName?: string;
  createdAt: string;
};

type ActivityItem = ActivityEvent & {
  leadingText: string;
  trailingText: string;
};

const toMessageParts = (
  e: ActivityEvent,
): Pick<ActivityItem, "leadingText" | "trailingText"> => {
  switch (e.type) {
    case "book_favourited":
      return {
        leadingText: "",
        trailingText: " was added to favourites",
      };
    case "book_collected":
      return {
        leadingText: "",
        trailingText: " was added to a collection",
      };
    case "creator_followed":
      return {
        leadingText: "",
        trailingText: " was followed",
      };
    case "book_commented":
      return {
        leadingText: "",
        trailingText: " was commented on",
      };
  }
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
        ...toMessageParts(event),
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
