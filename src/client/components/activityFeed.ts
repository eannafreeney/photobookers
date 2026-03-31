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

const toMessage = (e: ActivityEvent) => {
  switch (e.type) {
    case "book_liked":
      return `${e.actorName} just liked ${e.targetName} ${e.targetCreatorName ? `by ${e.targetCreatorName}` : ""}`;
    case "book_wishlisted":
      return `${e.actorName} just wishlisted ${e.targetName} ${e.targetCreatorName ? `by ${e.targetCreatorName}` : ""}`;
    case "book_collected":
      return `${e.actorName} added ${e.targetName} ${e.targetCreatorName ? `by ${e.targetCreatorName}` : ""}" to their collection`;
    case "creator_followed":
      return `${e.actorName} just followed ${e.targetName}`;
    case "book_commented":
      return `${e.actorName} just commented on ${e.targetName} ${e.targetCreatorName ? `by ${e.targetCreatorName}` : ""}`;
  }
};

export function registerActivityFeed() {
  Alpine.data("activityFeed", () => ({
    items: [] as Array<ActivityItem>,
    source: null as EventSource | null,

    connect() {
      this.source = new EventSource("/api/activity/stream");

      this.source.addEventListener("activity", (raw) => {
        const evt = JSON.parse((raw as MessageEvent).data) as ActivityEvent;

        const currentUserId =
          (this.$el as HTMLElement).dataset.currentUserId || null;
        if (currentUserId && evt.actorId === currentUserId) {
          return; // don't show my own activity
        }

        const messageParts = toMessageParts(evt);
        const item: ActivityItem = {
          ...evt,
          ...messageParts,
        };

        this.items.unshift(item);
        this.items = this.items.slice(0, 8);

        // auto remove transient item
        setTimeout(() => {
          this.items = this.items.filter((x) => x.id !== item.id);
        }, 6000);
      });

      this.source.onerror = () => {
        // browser retries automatically
      };
    },

    disconnect() {
      this.source?.close();
      this.source = null;
    },
  }));
}
