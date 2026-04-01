import Alpine from "alpinejs";

export function registerAdminNotificationsTable() {
  Alpine.data("adminNotificationsTable", () => ({
    observer: null as IntersectionObserver | null,

    init() {
      const rows = (
        this.$el as HTMLElement
      ).querySelectorAll<HTMLTableRowElement>("tr[data-notification-id]");

      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            this.markRowRead(entry.target as HTMLTableRowElement);
          }
        },
        { threshold: 0.5 },
      );

      rows.forEach((row) => this.observer?.observe(row));
    },

    markRowRead(row: HTMLTableRowElement) {
      if (row.dataset.read === "true") return;
      row.dataset.read = "true";
      row.classList.remove("bg-red-50");
      row.classList.add("bg-green-50");
    },

    markAllRead() {
      const rows = (
        this.$el as HTMLElement
      ).querySelectorAll<HTMLTableRowElement>("tr[data-notification-id]");
      rows.forEach((row) => this.markRowRead(row));

      // optional: reset badge
      window.dispatchEvent(new CustomEvent("admin-notifications:changed"));
    },
  }));
}
