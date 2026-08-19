import Alpine from "alpinejs";
import {
  formatRecentActivityAge,
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

type HomepageRecentActivityConfig = {
  items: SerializedRecentActivityItem[];
  currentUserId?: string | null;
};

export function registerHomepageRecentActivity() {
  Alpine.data(
    "homepageRecentActivity",
    (config: HomepageRecentActivityConfig) => ({
      items: config.items,
      maxItems: 10,
      currentUserId: config.currentUserId ?? null,
      now: Date.now(),
      tickTimer: null as number | null,
      source: null as EventSource | null,
      shouldReconnect: false,
      reconnectTimer: null as number | null,

      trailingText(type: RecentActivityType) {
        return recentActivityTrailingText(type);
      },

      timeAgo(createdAt: string) {
        return formatRecentActivityAge(createdAt, this.now);
      },

      connect() {
        if (this.source) return;

        this.shouldReconnect = true;
        this.now = Date.now();
        this.tickTimer = window.setInterval(() => {
          this.now = Date.now();
        }, 15_000);

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

        this.items.unshift(item);
        if (this.items.length > this.maxItems) {
          this.items = this.items.slice(0, this.maxItems);
        }

        const strip = this.$refs.strip as HTMLElement | undefined;
        if (strip) strip.scrollLeft = 0;
      },

      disconnect() {
        this.shouldReconnect = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        if (this.tickTimer) {
          clearInterval(this.tickTimer);
          this.tickTimer = null;
        }
        this.source?.close();
        this.source = null;
      },
    }),
  );
}
