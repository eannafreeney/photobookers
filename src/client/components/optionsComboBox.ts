import Alpine from "alpinejs";

export type OptionsComboBoxOption = {
  id: string;
  label: string;
  img?: string | null;
  verified?: boolean;
};

type OptionsComboBoxConfig = {
  multiple?: boolean;
  initialSelectedId?: string;
};

function inputRef(el: HTMLElement | undefined): HTMLInputElement | undefined {
  return el as HTMLInputElement | undefined;
}

function noResultsRef(el: HTMLElement | undefined): HTMLElement | undefined {
  return el;
}

export function registerOptionsComboBox() {
  Alpine.data(
    "optionsComboBox",
    (
      options: OptionsComboBoxOption[] = [],
      fieldName: string,
      config: OptionsComboBoxConfig = {},
    ) => {
      const { multiple = false, initialSelectedId = "" } = config;

      return {
        fieldName,
        multiple,
        allOptions: options,
        options: [] as OptionsComboBoxOption[],
        isOpen: false,
        openedWithKeyboard: false,

        // single-select state
        selectedOption: null as OptionsComboBoxOption | null,

        // multi-select state
        selectedOptions: [] as OptionsComboBoxOption[],

        init() {
          this.options = this.allOptions;

          if (!multiple && initialSelectedId) {
            const match = this.allOptions.find(
              (o) => o.id === initialSelectedId,
            );
            if (match) {
              this.selectedOption = match;
              const hidden = inputRef(this.$refs.hiddenTextField);
              if (hidden) hidden.value = match.id;
            }
          }
        },

        // --- shared ---

        getFilteredOptions(query: string) {
          this.options = this.allOptions.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase()),
          );

          const noResults = noResultsRef(this.$refs.noResultsMessage);
          if (!noResults) return;

          if (this.options.length === 0) {
            noResults.classList.remove("hidden");
          } else {
            noResults.classList.add("hidden");
          }
        },

        dispatchFieldUpdate(value: string | string[]) {
          this.$dispatch("form-field-update", {
            field: this.fieldName,
            value,
          });
        },

        // --- single-select ---

        setSelectedOption(option: OptionsComboBoxOption) {
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

        isSelected(option: OptionsComboBoxOption) {
          return this.selectedOptions.some((o) => o.id === option.id);
        },

        toggleOption(option: OptionsComboBoxOption) {
          if (this.isSelected(option)) {
            this.selectedOptions = this.selectedOptions.filter(
              (o) => o.id !== option.id,
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

        handleOptionClick(option: OptionsComboBoxOption) {
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
          return this.multiple
            ? this.selectedOptions.length > 0
            : this.selectedOption !== null;
        },

        isOptionHighlighted(option: OptionsComboBoxOption) {
          return this.multiple
            ? this.isSelected(option)
            : this.selectedOption === option;
        },
      };
    },
  );
}
