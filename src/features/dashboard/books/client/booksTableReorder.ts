import Alpine from "alpinejs";

export function registerBooksTableReorder() {
  Alpine.data(
    "booksTableReorder",
    (initialBookIds: string[] = [], creatorId: string | null = null) => ({
      bookIds: [...initialBookIds],
      creatorId,
      dragRow: null as HTMLTableRowElement | null,
      savedOrder: "",
      isSaving: false,

      init() {
        this.savedOrder = this.bookIds.join(",");
      },

      rowId(row: HTMLTableRowElement | null) {
        return row?.getAttribute("data-book-id") ?? "";
      },

      onReorderDragStart(event: DragEvent, row: HTMLTableRowElement | null) {
        if (!row) return;
        this.dragRow = row;
        const bookId = this.rowId(row);
        event.dataTransfer?.setData("text/plain", bookId);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      },

      onReorderDragEnter(targetRow: HTMLTableRowElement) {
        if (!this.dragRow || this.dragRow === targetRow) return;

        const dragId = this.rowId(this.dragRow);
        const targetId = this.rowId(targetRow);
        if (!dragId || !targetId || dragId === targetId) return;

        const from = this.bookIds.indexOf(dragId);
        const to = this.bookIds.indexOf(targetId);
        if (from < 0 || to < 0 || from === to) return;

        const [moved] = this.bookIds.splice(from, 1);
        this.bookIds.splice(to, 0, moved);

        if (from < to) {
          targetRow.after(this.dragRow);
        } else {
          targetRow.before(this.dragRow);
        }
      },

      async onReorderDragEnd() {
        this.dragRow = null;

        const currentOrder = this.bookIds.join(",");
        if (currentOrder === this.savedOrder || this.bookIds.length === 0) return;

        this.isSaving = true;

        try {
          const response = await fetch("/dashboard/books/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              orderedIds: this.bookIds,
              ...(this.creatorId ? { creatorId: this.creatorId } : {}),
            }),
          });

          const html = await response.text();
          const container = document.getElementById("toast");
          if (container) {
            container.outerHTML = html;
          }

          if (response.ok) {
            this.savedOrder = currentOrder;
          }
        } catch {
          const container = document.getElementById("toast");
          if (container) {
            container.outerHTML =
              '<ul x-sync id="toast" x-merge="prepend" role="status" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 "></ul>';
          }
        } finally {
          this.isSaving = false;
        }
      },
    }),
  );
}
