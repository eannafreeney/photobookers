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
      countries: [...new Set(printers.map((printer) => printer.country))].sort(),
      selectedCountries: [] as string[],
      countryOpen: false,

      countryLabel() {
        if (this.selectedCountries.length === 0) return "All countries";
        return this.selectedCountries.join(", ");
      },

      toggleCountry(country: string) {
        if (this.selectedCountries.includes(country)) {
          this.selectedCountries = this.selectedCountries.filter(
            (item) => item !== country,
          );
          return;
        }
        this.selectedCountries.push(country);
      },

      visible(printer: QuotePrinter) {
        if (this.selectedCountries.length === 0) return true;
        return this.selectedCountries.includes(printer.country);
      },

      isSelected(id: string) {
        return this.selectedIds.includes(id);
      },

      togglePrinter(id: string) {
        if (this.isSelected(id)) {
          this.selectedIds = this.selectedIds.filter((item) => item !== id);
          return;
        }
        if (this.selectedIds.length >= 3) return;
        this.selectedIds.push(id);
      },
    }),
  );
}
