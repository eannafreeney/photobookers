import Alpine from "alpinejs";

export type ComboBoxOption = {
  id: string;
  label: string;
  isNew?: boolean;
};

/** Alpine `$refs` are typed as HTMLElement; combobox uses hidden `<input>` refs. */
function inputRef(el: HTMLElement): HTMLInputElement {
  return el as HTMLInputElement;
}

type BookFormParentScope = {
  form?: Record<string, unknown>;
  is_new_artist?: boolean;
  is_new_publisher?: boolean;
};

/** Alpine 3 has no `$parent` magic — read parent `bookForm` from the wrapping `<form>`. */
function getBookFormScope(el: HTMLElement): BookFormParentScope | null {
  const formEl = el.closest("form");
  if (!formEl) return null;
  const data = Alpine.$data(formEl);
  if (!data || typeof data !== "object") return null;
  return data as BookFormParentScope;
}

type ComboBoxScope = {
  /** Same object reference as parent `bookForm.form`; assigned in `init()` */
  form?: Record<string, unknown>;
  is_new_artist?: boolean;
  is_new_publisher?: boolean;
};

export function registerComboBox() {
  Alpine.data(
    "comboBox",
    (options: ComboBoxOption[] = [], type: "artist" | "publisher") => {
      return {
        allOptions: options,
        options: [] as ComboBoxOption[],
        isOpen: false,
        openedWithKeyboard: false,
        selectedOption: null as ComboBoxOption | null,
        searchQuery: "",
        isDisabled: false,
        is_new_artist: false,
        is_new_publisher: false,
        form: undefined as Record<string, unknown> | undefined,

        init() {
          const bookForm = getBookFormScope(this.$el);
          if (bookForm?.form) {
            (this as unknown as ComboBoxScope).form = bookForm.form;
          }

          this.options = this.allOptions;

          const fieldName = type === "publisher" ? "publisher_id" : "artist_id";
          const initialValue = (this as unknown as ComboBoxScope).form?.[
            fieldName
          ];
          if (initialValue) {
            const match = this.allOptions.find(
              (opt) => opt.id === initialValue,
            );
            if (match) {
              this.selectedOption = match;
              inputRef(this.$refs.hiddenTextField).value = String(match.id);
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
        setSelectedOption(option: ComboBoxOption) {
          this.selectedOption = option;
          this.isOpen = false;
          this.openedWithKeyboard = false;

          const selectedId = option.isNew ? "" : (option.id ?? "");
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
        getFilteredOptions(query: string) {
          this.searchQuery = query;

          this.options = this.allOptions.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase()),
          );

          if (this.options.length === 0 && this.searchQuery) {
            this.highlightAddNew();
          }
        },
        handleKeydownOnOptions(event: KeyboardEvent) {
          if (
            (event.keyCode >= 65 && event.keyCode <= 90) ||
            (event.keyCode >= 48 && event.keyCode <= 57) ||
            event.keyCode === 8 ||
            event.keyCode === 32
          ) {
            this.$refs.searchField.focus();
          }
        },
      };
    },
  );
}
