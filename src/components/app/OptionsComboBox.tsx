import InputLabel from "../forms/InputLabel";

type Props = {
  options: {
    id: string;
    label: string;
    img?: string | null;
  }[];
  name: string;
  label?: string;
  required?: boolean;
  initialSelectedId?: string;
};

const OptionsComboBox = ({
  options,
  name,
  label = "Creator",
  required,
  initialSelectedId,
}: Props) => {
  return (
    <div
      x-data={`{
        fieldName: '${name.replace("form.", "")}',
        allOptions: ${JSON.stringify(options)},
        options: [],
        isOpen: false,
        openedWithKeyboard: false,
        selectedOption: null,
        initialSelectedId: ${JSON.stringify(initialSelectedId ?? "")},
        setSelectedOption(option) {
            this.selectedOption = option
            this.isOpen = false
            this.$refs.hiddenTextField.value = option.id
            this.$dispatch('form-field-update', { field: this.fieldName, value: option.id })
        },
        getFilteredOptions(query) {
            this.options = this.allOptions.filter((option) =>
                option.label.toLowerCase().includes(query.toLowerCase()),
            )
            if (this.options.length === 0) {
                this.$refs.noResultsMessage.classList.remove('hidden')
            } else {
                this.$refs.noResultsMessage.classList.add('hidden')
            }
        },
       
    }`}
      class="w-full flex flex-col gap-1"
      {...{
        "x-on:click.outside": "isOpen = false",
        "x-init":
          "options = allOptions; if (initialSelectedId) { const opt = allOptions.find(o => o.id === initialSelectedId); if (opt) { selectedOption = opt; if ($refs.hiddenTextField) $refs.hiddenTextField.value = opt.id } }",
      }}
    >
      <div class="relative">
        {/* trigger button  */}
        <fieldset class="grid gap-1.5 text-xs grid-cols-1 auto-rows-max">
          <InputLabel label={label} name={name} required={required} />
          <label class="bg-surface-alt -mb-1 rounded-radius border border-outline text-on-surface-alt flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
            <button
              type="button"
              x-on:click="isOpen = !isOpen"
              class="w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal text-left focus:outline-none"
              x-text="selectedOption ? selectedOption.label : 'Please Select'"
            ></button>
            <button
              type="button"
              {...{
                "x-cloak": "true",
                "x-show": "selectedOption !== null",
                "x-on:click.stop":
                  "selectedOption = null; $refs.hiddenTextField.value = ''; $dispatch('form-field-update', { field: fieldName, value: '' })",
              }}
              class="text-on-surface-alt hover:text-on-surface focus:outline-none"
            >
              {clearIcon}
            </button>
            {chevronIcon}
          </label>
        </fieldset>

        <input
          id={name}
          name={name.replace("form.", "")}
          type="text"
          x-ref="hiddenTextField"
          hidden
        />
        <div
          id="list"
          class="absolute left-0 top-16 z-10 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt"
          {...{
            "x-show": "isOpen",
            "x-on:click.outside": "isOpen = false",
            "x-transition": "",
          }}
        >
          {/* Search  */}
          <div class="relative">
            {searchIcon}
            <input
              type="text"
              class="w-full border-b border-outline bg-surface-alt py-2.5 pl-11 pr-4 text-sm text-on-surface focus:outline-hidden focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-75 dark:border-outline-dark dark:bg-surface-dark-alt dark:text-on-surface-dark dark:focus-visible:border-primary-dark"
              name="searchField"
              x-on:input="getFilteredOptions($el.value)"
              x-ref="searchField"
              placeholder="Search"
            />
          </div>
          {/* Options  */}
          <ul
            id="list"
            class="flex max-h-88 w-full flex-col overflow-hidden overflow-y-auto border-outline bg-surface-alt py-1.5 rounded-radius border"
          >
            <li
              class="hidden px-4 py-2 text-sm text-on-surface"
              x-ref="noResultsMessage"
            >
              <span>No matches found</span>
            </li>
            <template x-for="(item, index) in options" x-bind:key="index">
              <li
                class="combobox-option cursor-pointer inline-flex justify-between items-center gap-6 bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-primary/10 hover:text-on-surface-strong focus-visible:bg-primary/10 focus-visible:text-on-surface-strong focus-visible:outline-primary focus-visible:outline-offset-1 focus-visible:outline rounded-radius"
                tabindex={0}
                x-on:click="setSelectedOption(item)"
                {...{
                  "x-on:keydown.enter": "setSelectedOption(item)",
                  "x-bind:id": "'option-' + index",
                }}
              >
                <div class="flex items-center gap-2">
                  <img
                    class="size-8 rounded-full"
                    x-bind:src="item.img"
                    alt="Creator avatar"
                  />
                  <div class="flex flex-col">
                    <span
                      x-bind:class="selectedOption == item ? 'font-bold' : null"
                      x-text="item.label"
                    ></span>
                  </div>
                </div>
                {iconCheck}
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OptionsComboBox;

const clearIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-4"
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

const chevronIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-5"
  >
    <path
      fill-rule="evenodd"
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clip-rule="evenodd"
    />
  </svg>
);

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    class="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-on-surface/50 dark:text-on-surface-dark/50"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const iconCheck = (
  <svg
    x-cloak
    x-show="selectedOption == item"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    class="size-4"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);
