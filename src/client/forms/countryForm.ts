import Alpine from "alpinejs";
import { countries } from "../../lib/countries";

export function registerCountryForm() {
  Alpine.data("countryForm", () => {
    return {
      allOptions: countries,
      options: [],
      isOpen: false,
      selectedOption: null,
      init() {
        this.options = this.allOptions;

        // Access parent form's country value
        const initialValue = this.form?.country;
        if (initialValue) {
          const match = this.allOptions.find(
            (opt) =>
              opt.iso.toUpperCase() === initialValue.toUpperCase() ||
              opt.value === initialValue
          );
          if (match) {
            this.selectedOption = match;
            this.$refs.hiddenCountryInput.value = match.iso.toUpperCase();
          }
        }
      },
      setSelectedOption(option) {
        this.selectedOption = option;
        this.isOpen = false;
        
        this.$refs.hiddenCountryInput.value = option.label;

        // Trigger input event so x-model picks up the change
        this.$nextTick(() => {
          this.$refs.hiddenCountryInput.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        });
      },
      getFilteredOptions(query) {
        this.options = this.allOptions.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase())
        );
        if (this.options.length === 0) {
          this.$refs.noResultsMessage.classList.remove("hidden");
        } else {
          this.$refs.noResultsMessage.classList.add("hidden");
        }
      },
      handleKeydownOnOptions(event) {
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
