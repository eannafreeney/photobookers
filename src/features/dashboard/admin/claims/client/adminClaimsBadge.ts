import Alpine from "alpinejs";

export function registerAdminClaimsBadge() {
  Alpine.data("adminClaimsBadge", () => ({
    count: 0,

    async refresh() {
      const res = await fetch("/dashboard/admin/claims/pending-count");
      if (!res.ok) return;
      const data = (await res.json()) as { count: number };
      this.count = data.count ?? 0;
    },

    init() {
      this.refresh();
      window.addEventListener("admin-claims:updated", () => this.refresh());
    },
  }));
}
