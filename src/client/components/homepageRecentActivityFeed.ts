import Alpine from "alpinejs";
import {
  activityActorAvatarUrl,
  formatRecentActivityAge,
  liveActivityEventToStripItem,
  parseHomepageRecentActivityConfig,
  recentActivityVerb,
  shouldShowLiveActivityEvent,
  type RecentActivityType,
  type SerializedRecentActivityItem,
} from "../../features/app/homepageRecentActivityUtils";

type LiveActivityEvent = {
  id: string;
  type: RecentActivityType;
  actorId?: string;
  actorName?: string;
  actorImageUrl?: string | null;
  targetName: string;
  targetImageUrl?: string | null;
  targetUrl?: string;
  targetCreatorName?: string;
  createdAt: string;
};

type RecentActivityPageResponse = {
  items: SerializedRecentActivityItem[];
  hasMore: boolean;
  nextOffset: number;
};

const MAX_STRIP_ITEMS = 48;
/** How long a freshly arrived card keeps its highlight. */
const NEW_ITEM_MS = 2600;

/** Alpine needs the flag present up front to track it reactively. */
type StripItem = SerializedRecentActivityItem & { isNew?: boolean };

export function registerHomepageRecentActivity() {
  Alpine.data("homepageRecentActivity", () => ({
    items: [] as StripItem[],
    pageSize: 10,
    nextOffset: 0,
    hasMore: false,
    loadingMore: false,
    currentUserId: null as string | null,
    now: Date.now(),
    tickTimer: null as number | null,
    source: null as EventSource | null,
    connected: false,
    shouldReconnect: false,
    reconnectTimer: null as number | null,

    init() {
      const config = parseHomepageRecentActivityConfig(
        this.$el.getAttribute("data-recent-activity"),
      );
      this.items = config.items.map((item) => ({ ...item, isNew: false }));
      this.currentUserId = config.currentUserId ?? null;
      this.hasMore = config.hasMore ?? false;
      this.nextOffset = config.nextOffset ?? config.items.length;
      this.pageSize = config.pageSize ?? 10;
      this.$el
        .querySelectorAll("[data-recent-activity-ssr]")
        .forEach((node) => node.remove());
      this.connect();
    },

    verb(type: RecentActivityType) {
      return recentActivityVerb(type);
    },

    avatar(item: StripItem) {
      return activityActorAvatarUrl(item);
    },

    timeAgo(createdAt: string) {
      return formatRecentActivityAge(createdAt, this.now);
    },

    onStripScroll(event: Event) {
      const strip = event.currentTarget as HTMLElement | null;
      if (!strip || this.loadingMore || !this.hasMore) return;

      const nearEnd =
        strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 96;
      if (nearEnd) void this.loadMore();
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore) return;

      this.loadingMore = true;
      try {
        const params = new URLSearchParams({
          offset: String(this.nextOffset),
          limit: String(this.pageSize),
        });
        const response = await fetch(`/api/activity/recent?${params}`);
        if (!response.ok) return;

        const data = (await response.json()) as RecentActivityPageResponse;
        const existingIds = new Set(this.items.map((item) => item.id));

        for (const item of data.items) {
          if (existingIds.has(item.id)) continue;
          this.items.push({ ...item, isNew: false });
          existingIds.add(item.id);
        }

        this.hasMore = data.hasMore;
        this.nextOffset = data.nextOffset;
      } catch {
        // ignore transient network errors
      } finally {
        this.loadingMore = false;
      }
    },

    connect() {
      if (this.source) return;

      this.shouldReconnect = true;
      this.now = Date.now();
      this.tickTimer = window.setInterval(() => {
        this.now = Date.now();
      }, 15_000);

      this.source = new EventSource("/api/activity/stream");

      this.source.addEventListener("open", () => {
        this.connected = true;
      });

      this.source.addEventListener("activity", (message: MessageEvent) => {
        try {
          const event = JSON.parse(message.data) as LiveActivityEvent;
          this.prependLiveActivity(event);
        } catch {
          // ignore malformed payloads
        }
      });

      this.source.addEventListener("error", () => {
        this.connected = false;
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

      const arriving: StripItem = { ...item, isNew: true };
      this.items.unshift(arriving);
      if (this.items.length > MAX_STRIP_ITEMS) {
        this.items = this.items.slice(0, MAX_STRIP_ITEMS);
      }

      // Drop the highlight so a card only animates on arrival, not on re-render.
      window.setTimeout(() => {
        const entry = this.items.find((candidate) => candidate.id === item.id);
        if (entry) entry.isNew = false;
      }, NEW_ITEM_MS);

      const strip = this.$refs.strip as HTMLElement | undefined;
      if (strip) strip.scrollTo({ left: 0, behavior: "smooth" });
    },

    disconnect() {
      this.shouldReconnect = false;
      this.connected = false;
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
  }));
}
