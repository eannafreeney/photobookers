import Alpine from "alpinejs";
import { countries } from "../../lib/countries";

export function registerCountryForm() {
  Alpine.data("countryForm", () => {
    return {
      allOptions: countries,
      options: [] as { label: string; iso: string }[],
      isOpen: false,
      selectedOption: null as { label: string; iso: string } | null,
      init() {
        this.options = this.allOptions;

        this.$nextTick(() => {
          const input = this.$refs.hiddenCountryInput as
            | HTMLInputElement
            | undefined;
          const initialValue = input?.value?.trim();
          if (initialValue) {
            const match = this.allOptions.find(
              (opt) =>
                opt.iso.toUpperCase() === initialValue.toUpperCase() ||
                opt.label === initialValue,
            );
            if (match) {
              this.selectedOption = match;
              if (input) input.value = match.label;
            }
          }
        });
      },
      setSelectedOption(option: { label: string; iso: string }) {
        this.selectedOption = option;
        this.isOpen = false;

        const input = this.$refs.hiddenCountryInput as HTMLInputElement;
        input.value = option.label;

        this.$refs.hiddenCountryInput.value = option.label;

        // Trigger input event so x-model picks up the change
        this.$nextTick(() => {
          this.$refs.hiddenCountryInput.dispatchEvent(
            new Event("input", { bubbles: true }),
          );
        });
      },
      getFilteredOptions(query: string) {
        this.options = this.allOptions.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase()),
        );
        if (this.options.length === 0) {
          this.$refs.noResultsMessage.classList.remove("hidden");
        } else {
          this.$refs.noResultsMessage.classList.add("hidden");
        }
      },
      handleKeydownOnOptions(event: KeyboardEvent) {
        // if the user presses backspace or the alpha-numeric keys, focus on the search field
        if (
          (event.keyCode >= 65 && event.keyCode <= 90) ||
          (event.keyCode >= 48 && event.keyCode <= 57) ||
          event.keyCode === 8
        ) {
          this.$refs.searchField.focus();
        }
      },
    };
  });
}
