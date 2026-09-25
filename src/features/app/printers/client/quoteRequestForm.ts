import Alpine from "alpinejs";

type QuotePrinter = {
  id: string;
  name: string;
  city: string;
  country: string;
};

export function registerQuoteRequestForm() {
  Alpine.data(
    "quoteRequestForm",
    (printers: QuotePrinter[], preselectedId: string | null) => ({
      printers,
      selectedIds: (preselectedId ? [preselectedId] : []) as string[],

      selectedPrinters() {
        return this.selectedIds
          .map((id) => this.printers.find((printer) => printer.id === id))
          .filter((printer) => printer != null);
      },
    }),
  );
}
