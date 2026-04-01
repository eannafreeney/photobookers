import Alpine from "alpinejs";

type ActivityEvent = {
  id: string;
  type:
    | "book_liked"
    | "book_wishlisted"
    | "book_collected"
    | "creator_followed"
    | "book_commented";
  actorId?: string;
  actorName: string;
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
        leadingText: `${e.actorName} just liked `,
        trailingText: "",
      };
    case "book_wishlisted":
      return {
        leadingText: `${e.actorName} just wishlisted `,
        trailingText: "",
      };
    case "book_collected":
      return {
        leadingText: `${e.actorName} added `,
        trailingText: " to their collection",
      };
    case "creator_followed":
      return {
        leadingText: `${e.actorName} just followed `,
        trailingText: "",
      };
    case "book_commented":
      return {
        leadingText: `${e.actorName} just commented on `,
        trailingText: "",
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
      this.source = new EventSource("/api/activity/stream");

      this.source.addEventListener("activity", (raw) => {
        const evt = JSON.parse((raw as MessageEvent).data) as ActivityEvent;

        const currentUserId =
          (this.$el as HTMLElement).dataset.currentUserId || null;
        if (currentUserId && evt.actorId === currentUserId) return;

        const item: ActivityItem = { ...evt, ...toMessageParts(evt) };

        // Desktop: keep stacked feed
        this.items.unshift(item);
        this.items = this.items.slice(0, this.maxDesktopItems);
        setTimeout(() => {
          this.items = this.items.filter((x) => x.id !== item.id);
        }, this.desktopDurationMs);

        // Mobile: queue one-at-a-time
        this.queue.push(item);
        this.pendingCount = this.queue.length + (this.activeItem ? 1 : 0) - 1;
        this.showNextMobile();
      });

      this.source.onerror = () => {
        // browser retries automatically
      };
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
