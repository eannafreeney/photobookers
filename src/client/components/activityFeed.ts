import Alpine from "alpinejs";

type ActivityEvent = {
  id: string;
  type:
    | "book_liked"
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
    case "book_liked":
      return {
        leadingText: "",
        trailingText: " was favourited",
      };
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

export function registerActivityFeed() {
  Alpine.data("activityFeed", () => ({
    // Desktop stack
    items: [] as ActivityItem[],

    // Mobile queue state
    queue: [] as ActivityItem[],
    activeItem: null as ActivityItem | null,
    pendingCount: 0,
    activeTimer: null as ReturnType<typeof setTimeout> | null,

    source: null as EventSource | null,
    maxDesktopItems: 8,
    desktopDurationMs: 6000,
    mobileDurationMs: 4000,

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
    },
  }));
}
