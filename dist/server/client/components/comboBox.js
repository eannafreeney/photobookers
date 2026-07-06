import Alpine from "alpinejs";
function inputRef(el) {
  return el;
}
function getBookFormScope(el) {
  const formEl = el.closest("form");
  if (!formEl) return null;
  const data = Alpine.$data(formEl);
  if (!data || typeof data !== "object") return null;
  return data;
}
function registerComboBox() {
  Alpine.data(
    "comboBox",
    (options = [], type, disableOnInit = true) => {
      return {
        allOptions: options,
        options: [],
        isOpen: false,
        openedWithKeyboard: false,
        selectedOption: null,
        searchQuery: "",
        isDisabled: false,
        is_new_artist: false,
        is_new_publisher: false,
        form: void 0,
        init() {
          const bookForm = getBookFormScope(this.$el);
          if (bookForm?.form) {
            this.form = bookForm.form;
          }
          this.options = this.allOptions;
          const fieldName = type === "publisher" ? "publisher_id" : "artist_id";
          const initialValue = this.form?.[fieldName];
          if (initialValue) {
            const match = this.allOptions.find(
              (opt) => opt.id === initialValue
            );
            if (match) {
              this.selectedOption = match;
              inputRef(this.$refs.hiddenTextField).value = String(match.id);
              this.isDisabled = disableOnInit;
            }
          }
        },
        addNewOption() {
          const label = this.toTitleCase(this.searchQuery.trim());
          if (!label) return;
          const exists = this.allOptions.some(
            (opt) => opt.label.toLowerCase() === label.toLowerCase()
          );
          if (exists) return;
          const newOption = { id: `new-${Date.now()}`, label, isNew: true };
          this.allOptions.push(newOption);
          this.setSelectedOption(newOption);
        },
        toTitleCase(str) {
          return str.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        },
        clearSearch() {
          this.searchQuery = "";
          const search = inputRef(this.$refs.searchField);
          search.value = "";
          this.options = this.allOptions;
          search.focus();
        },
        clearSelection() {
          this.selectedOption = null;
          inputRef(this.$refs.hiddenTextField).value = "";
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
          const selectedId = option.isNew ? "" : option.id ?? "";
          const newName = option.isNew ? option.label : "";
          const hidden = inputRef(this.$refs.hiddenTextField);
          const newNameField = inputRef(this.$refs.newOptionNameField);
          hidden.value = selectedId;
          newNameField.value = newName;
          const bookForm = getBookFormScope(this.$el);
          if (type === "artist" && option.isNew) {
            this.is_new_artist = true;
            if (bookForm) bookForm.is_new_artist = true;
          } else if (type === "publisher" && option.isNew) {
            this.is_new_publisher = true;
            if (bookForm) bookForm.is_new_publisher = true;
          }
          this.$nextTick(() => {
            hidden.dispatchEvent(new Event("input", { bubbles: true }));
            newNameField.dispatchEvent(new Event("input", { bubbles: true }));
          });
        },
        getFilteredOptions(query) {
          this.searchQuery = query;
          this.options = this.allOptions.filter(
            (option) => option.label.toLowerCase().includes(query.toLowerCase())
          );
          if (this.options.length === 0 && this.searchQuery) {
            this.highlightAddNew();
          }
        },
        handleKeydownOnOptions(event) {
          if (event.keyCode >= 65 && event.keyCode <= 90 || event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode === 8 || event.keyCode === 32) {
            this.$refs.searchField.focus();
          }
        }
      };
    }
  );
}
export {
  registerComboBox
};
