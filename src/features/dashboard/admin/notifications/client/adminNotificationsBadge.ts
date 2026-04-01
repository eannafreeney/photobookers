import Alpine from "alpinejs";

export function registerAdminNotificationsBadge() {
  Alpine.data("adminNotificationsBadge", () => ({
    count: 0,

    async refresh() {
      const res = await fetch("/dashboard/admin/notifications/unread-count");
      if (!res.ok) return;
      const data = (await res.json()) as { count: number };
      this.count = data.count ?? 0;
    },

    init() {
      this.refresh();
      window.addEventListener("admin-notifications:changed", () =>
        this.refresh(),
      );
    },
  }));
}
