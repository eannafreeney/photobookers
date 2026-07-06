import Alpine from "alpinejs";
import { countries } from "../../../lib/countries.js";
function registerCountryForm() {
  Alpine.data("countryForm", () => {
    return {
      allOptions: countries,
      options: [],
      isOpen: false,
      selectedOption: null,
      init() {
        this.options = this.allOptions;
        this.$nextTick(() => {
          const input = this.$refs.hiddenCountryInput;
          const initialValue = input?.value?.trim();
          if (initialValue) {
            const match = this.allOptions.find(
              (opt) => opt.iso.toUpperCase() === initialValue.toUpperCase() || opt.label === initialValue
            );
            if (match) {
              this.selectedOption = match;
              if (input) input.value = match.label;
            }
          }
        });
      },
      setSelectedOption(option) {
        this.selectedOption = option;
        this.isOpen = false;
        const input = this.$refs.hiddenCountryInput;
        input.value = option.label;
        this.$nextTick(() => {
          this.$refs.hiddenCountryInput.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        });
      },
      getFilteredOptions(query) {
        this.options = this.allOptions.filter(
          (option) => option.label.toLowerCase().includes(query.toLowerCase())
        );
        if (this.options.length === 0) {
          this.$refs.noResultsMessage.classList.remove("hidden");
        } else {
          this.$refs.noResultsMessage.classList.add("hidden");
        }
      },
      handleKeydownOnOptions(event) {
        if (event.keyCode >= 65 && event.keyCode <= 90 || event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode === 8) {
          this.$refs.searchField.focus();
        }
      }
    };
  });
}
export {
  registerCountryForm
};
