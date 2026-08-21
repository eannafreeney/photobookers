import Alpine from "alpinejs";
import {
  activityActorAvatarUrl,
  formatRecentActivityAge,
  liveActivityEventToStripItem,
  parseHomepageRecentActivityConfig,
  recentActivityVerb,
  shouldShowLiveActivityEvent
} from "../../features/app/homepageRecentActivityUtils.js";
const MAX_STRIP_ITEMS = 48;
const NEW_ITEM_MS = 2600;
function registerHomepageRecentActivity() {
  Alpine.data("homepageRecentActivity", () => ({
    items: [],
    pageSize: 10,
    nextOffset: 0,
    hasMore: false,
    loadingMore: false,
    currentUserId: null,
    now: Date.now(),
    tickTimer: null,
    source: null,
    connected: false,
    shouldReconnect: false,
    reconnectTimer: null,
    init() {
      const config = parseHomepageRecentActivityConfig(
        this.$el.getAttribute("data-recent-activity")
      );
      this.items = config.items.map((item) => ({ ...item, isNew: false }));
      this.currentUserId = config.currentUserId ?? null;
      this.hasMore = config.hasMore ?? false;
      this.nextOffset = config.nextOffset ?? config.items.length;
      this.pageSize = config.pageSize ?? 10;
      this.$el.querySelectorAll("[data-recent-activity-ssr]").forEach((node) => node.remove());
      this.connect();
    },
    verb(type) {
      return recentActivityVerb(type);
    },
    avatar(item) {
      return activityActorAvatarUrl(item);
    },
    timeAgo(createdAt) {
      return formatRecentActivityAge(createdAt, this.now);
    },
    onStripScroll(event) {
      const strip = event.currentTarget;
      if (!strip || this.loadingMore || !this.hasMore) return;
      const nearEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 96;
      if (nearEnd) void this.loadMore();
    },
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return;
      this.loadingMore = true;
      try {
        const params = new URLSearchParams({
          offset: String(this.nextOffset),
          limit: String(this.pageSize)
        });
        const response = await fetch(`/api/activity/recent?${params}`);
        if (!response.ok) return;
        const data = await response.json();
        const existingIds = new Set(this.items.map((item) => item.id));
        for (const item of data.items) {
          if (existingIds.has(item.id)) continue;
          this.items.push({ ...item, isNew: false });
          existingIds.add(item.id);
        }
        this.hasMore = data.hasMore;
        this.nextOffset = data.nextOffset;
      } catch {
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
      }, 15e3);
      this.source = new EventSource("/api/activity/stream");
      this.source.addEventListener("open", () => {
        this.connected = true;
      });
      this.source.addEventListener("activity", (message) => {
        try {
          const event = JSON.parse(message.data);
          this.prependLiveActivity(event);
        } catch {
        }
      });
      this.source.addEventListener("error", () => {
        this.connected = false;
        this.source?.close();
        this.source = null;
        if (!this.shouldReconnect) return;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = window.setTimeout(() => this.connect(), 5e3);
      });
    },
    prependLiveActivity(event) {
      if (!shouldShowLiveActivityEvent(event, this.currentUserId)) return;
      const item = liveActivityEventToStripItem(event);
      if (!item) return;
      if (this.items.some((entry) => entry.id === item.id)) return;
      const arriving = { ...item, isNew: true };
      this.items.unshift(arriving);
      if (this.items.length > MAX_STRIP_ITEMS) {
        this.items = this.items.slice(0, MAX_STRIP_ITEMS);
      }
      window.setTimeout(() => {
        const entry = this.items.find((candidate) => candidate.id === item.id);
        if (entry) entry.isNew = false;
      }, NEW_ITEM_MS);
      const strip = this.$refs.strip;
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
    }
  }));
}
export {
  registerHomepageRecentActivity
};
