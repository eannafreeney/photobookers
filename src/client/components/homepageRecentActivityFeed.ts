import Alpine from "alpinejs";
import {
  liveActivityEventToStripItem,
  recentActivityTrailingText,
  shouldShowLiveActivityEvent,
  type RecentActivityType,
  type SerializedRecentActivityItem,
} from "../../features/app/homepageRecentActivityUtils";

type LiveActivityEvent = {
  id: string;
  type: RecentActivityType;
  actorId?: string;
  targetName: string;
  targetImageUrl?: string | null;
  targetUrl?: string;
  targetCreatorName?: string;
  createdAt: string;
};

type StripItem = SerializedRecentActivityItem & { isNew?: boolean };

type HomepageRecentActivityConfig = {
  items: SerializedRecentActivityItem[];
  currentUserId?: string | null;
};

export function registerHomepageRecentActivity() {
  Alpine.data(
    "homepageRecentActivity",
    (config: HomepageRecentActivityConfig) => ({
      items: config.items as StripItem[],
      maxItems: 10,
      currentUserId: config.currentUserId ?? null,
      source: null as EventSource | null,
      shouldReconnect: false,
      reconnectTimer: null as number | null,

      trailingText(type: RecentActivityType) {
        return recentActivityTrailingText(type);
      },

      connect() {
        if (this.source) return;

        this.shouldReconnect = true;
        this.source = new EventSource("/api/activity/stream");

        this.source.addEventListener("activity", (message: MessageEvent) => {
          try {
            const event = JSON.parse(message.data) as LiveActivityEvent;
            this.prependLiveActivity(event);
          } catch {
            // ignore malformed payloads
          }
        });

        this.source.addEventListener("error", () => {
          this.source?.close();
          this.source = null;
          if (!this.shouldReconnect) return;
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = window.setTimeout(() => this.connect(), 5000);
        });
      },

      prependLiveActivity(event: LiveActivityEvent) {
        if (!shouldShowLiveActivityEvent(event, this.currentUserId)) return;

        const item = liveActivityEventToStripItem(event);
        if (!item) return;
        if (this.items.some((entry) => entry.id === item.id)) return;

        this.items.unshift({ ...item, isNew: true });
        if (this.items.length > this.maxItems) {
          this.items = this.items.slice(0, this.maxItems);
        }

        const strip = this.$refs.strip as HTMLElement | undefined;
        if (strip) strip.scrollLeft = 0;

        window.setTimeout(() => {
          const entry = this.items.find((row) => row.id === item.id);
          if (entry) entry.isNew = false;
        }, 2500);
      },

      disconnect() {
        this.shouldReconnect = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.source?.close();
        this.source = null;
      },
    }),
  );
}
