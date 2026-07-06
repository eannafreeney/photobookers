import Alpine from "alpinejs";
function inputRef(el) {
  return el;
}
function noResultsRef(el) {
  return el;
}
function registerOptionsComboBox() {
  Alpine.data(
    "optionsComboBox",
    (options = [], fieldName, config = {}) => {
      const { multiple = false, initialSelectedId = "" } = config;
      return {
        fieldName,
        multiple,
        allOptions: options,
        options: [],
        isOpen: false,
        openedWithKeyboard: false,
        // single-select state
        selectedOption: null,
        // multi-select state
        selectedOptions: [],
        init() {
          this.options = this.allOptions;
          if (!multiple && initialSelectedId) {
            const match = this.allOptions.find(
              (o) => o.id === initialSelectedId
            );
            if (match) {
              this.selectedOption = match;
              const hidden = inputRef(this.$refs.hiddenTextField);
              if (hidden) hidden.value = match.id;
            }
          }
        },
        // --- shared ---
        getFilteredOptions(query) {
          this.options = this.allOptions.filter(
            (option) => option.label.toLowerCase().includes(query.toLowerCase())
          );
          const noResults = noResultsRef(this.$refs.noResultsMessage);
          if (!noResults) return;
          if (this.options.length === 0) {
            noResults.classList.remove("hidden");
          } else {
            noResults.classList.add("hidden");
          }
        },
        dispatchFieldUpdate(value) {
          this.$dispatch("form-field-update", {
            field: this.fieldName,
            value
          });
        },
        // --- single-select ---
        setSelectedOption(option) {
          this.selectedOption = option;
          this.isOpen = false;
          const hidden = inputRef(this.$refs.hiddenTextField);
          if (hidden) hidden.value = option.id;
          this.dispatchFieldUpdate(option.id);
        },
        clearSingleSelection() {
          this.selectedOption = null;
          const hidden = inputRef(this.$refs.hiddenTextField);
          if (hidden) hidden.value = "";
          this.dispatchFieldUpdate("");
        },
        // --- multi-select ---
        isSelected(option) {
          return this.selectedOptions.some((o) => o.id === option.id);
        },
        toggleOption(option) {
          if (this.isSelected(option)) {
            this.selectedOptions = this.selectedOptions.filter(
              (o) => o.id !== option.id
            );
          } else {
            this.selectedOptions = [...this.selectedOptions, option];
          }
          this.dispatchFieldUpdate(this.selectedOptions.map((o) => o.id));
        },
        clearMultiSelection() {
          this.selectedOptions = [];
          this.dispatchFieldUpdate([]);
        },
        selectedLabel() {
          if (this.selectedOptions.length === 0) return "";
          if (this.selectedOptions.length === 1) {
            return this.selectedOptions[0].label;
          }
          return `${this.selectedOptions.length} selected`;
        },
        // --- helpers for markup ---
        handleOptionClick(option) {
          if (this.multiple) {
            this.toggleOption(option);
          } else {
            this.setSelectedOption(option);
          }
        },
        clearSelection() {
          if (this.multiple) {
            this.clearMultiSelection();
          } else {
            this.clearSingleSelection();
          }
        },
        hasSelection() {
          return this.multiple ? this.selectedOptions.length > 0 : this.selectedOption !== null;
        },
        isOptionHighlighted(option) {
          return this.multiple ? this.isSelected(option) : this.selectedOption === option;
        }
      };
    }
  );
}
export {
  registerOptionsComboBox
};
