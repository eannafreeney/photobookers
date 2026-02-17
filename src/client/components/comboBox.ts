import Alpine from "alpinejs";

export function registerComboBox() {
  Alpine.data("comboBox", (options = [], type: "artist" | "publisher") => {
    return {
      allOptions: options,
      options: [],
      isOpen: false,
      openedWithKeyboard: false,
      selectedOption: null,
      searchQuery: "",
      isDisabled: false,

      init() {
        this.options = this.allOptions;

        // Use the form field that matches this combobox type (artist vs publisher)
        const fieldName = type === "publisher" ? "publisher_id" : "artist_id";
        const initialValue = this.form?.[fieldName];
        if (initialValue) {
          const match = this.allOptions.find((opt) => opt.id === initialValue);
          if (match) {
            this.selectedOption = match;
            this.$refs.hiddenTextField.value = match.id;
            this.isDisabled = true;
          }
        }
      },

      addNewOption() {
        const label = this.toTitleCase(this.searchQuery.trim());
        if (!label) return;

        const exists = this.allOptions.some(
          (opt) => opt.label.toLowerCase() === label.toLowerCase(),
        );

        if (exists) return;

        const newOption = { id: `new-${Date.now()}`, label, isNew: true };
        this.allOptions.push(newOption);
        this.setSelectedOption(newOption);
      },
      toTitleCase(str: string) {
        return str.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
        );
      },
      clearSearch() {
        this.searchQuery = "";
        this.$refs.searchField.value = "";
        this.options = this.allOptions;
        this.$refs.searchField.focus();
      },
      clearSelection() {
        this.selectedOption = null;
        this.$refs.hiddenTextField.value = "";
      },
      highlightAddNew() {
        this.$nextTick(() => {
          this.$refs.addNewOption?.focus();
        });
      },
      setSelectedOption(option) {
        this.selectedOption = option;
        this.isOpen = false;
        this.openedWithKeyboard = false;

        const selectedId = option.isNew ? "" : (option.id ?? "");
        const newName = option.isNew ? option.label : "";

        // Set values - x-model will handle reactivity
        this.$refs.hiddenTextField.value = selectedId;
        this.$refs.newOptionNameField.value = newName;

        if (type === "artist" && option.isNew) {
          this.is_new_artist = true;
        } else if (type === "publisher" && option.isNew) {
          this.is_new_publisher = true;
        }

        // Trigger input event so x-model picks up the change
        this.$nextTick(() => {
          this.$refs.hiddenTextField.dispatchEvent(
            new Event("input", { bubbles: true }),
          );
          this.$refs.newOptionNameField.dispatchEvent(
            new Event("input", { bubbles: true }),
          );
        });
      },
      getFilteredOptions(query) {
        this.searchQuery = query;

        this.options = this.allOptions.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase()),
        );

        if (this.options.length === 0 && this.searchQuery) {
          this.highlightAddNew();
        }
      },
      handleKeydownOnOptions(event) {
        // if the user presses backspace or the alpha-numeric keys, focus on the search field
        if (
          (event.keyCode >= 65 && event.keyCode <= 90) ||
          (event.keyCode >= 48 && event.keyCode <= 57) ||
          event.keyCode === 8 ||
          event.keyCode === 32 // Add space key
        ) {
          this.$refs.searchField.focus();
        }
      },
    };
  });
}
