import { fadeTransition } from "../../../lib/transitions";
import InputLabel from "./InputLabel";

const CountrySelect = () => {
  return (
    <div
      x-data="countryForm()"
      class="flex w-full max-w-xs flex-col gap-1"
      x-on:keydown="handleKeydownOnOptions($event)"
      x-init="options = allOptions"
    >
      <fieldset class="fieldset py-0">
        <InputLabel label="Country" name="country" required />
        <div class="relative">
          <TriggerButton />
          <input
            id="country"
            name="country"
            autocomplete="off"
            x-model="form.country"
            x-ref="hiddenCountryInput"
            hidden
          />
          <DropdownList />
        </div>
      </fieldset>
    </div>
  );
};

export default CountrySelect;

const TriggerButton = () => (
  <button
    type="button"
    class="inline-flex w-full items-center justify-between gap-2 border border-outline rounded-radius bg-surface-alt px-4 py-2 text-sm font-medium tracking-wide text-on-surface transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
    x-on:click="isOpen = ! isOpen"
  >
    <div class="flex items-center gap-2">
      <img
        class="w-5 h-3.5"
        x-bind:src="selectedOption?.iso ? 'https://flagcdn.com/' + selectedOption.iso + '.svg' : ''"
      />
      <span
        class="text-sm font-normal"
        x-text="selectedOption ? selectedOption.label : 'Please Select'"
      ></span>
    </div>
    {chevronIcon}
  </button>
);

const DropdownList = () => (
  <div
    x-show="isOpen"
    id="countriesList"
    class="absolute left-0 top-11 z-10 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt"
    role="listbox"
    {...{ "x-on:click.outside": "isOpen = false" }}
    {...fadeTransition}
  >
    <div class="relative">
      {searchIcon}
      <input
        type="text"
        class="w-full border-b border-outline bg-surface-alt py-2.5 pl-11 pr-4 text-sm text-on-surface focus:outline-hidden focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-75"
        name="searchField"
        aria-label="Search"
        x-on:input="getFilteredOptions($el.value)"
        x-ref="searchField"
        placeholder="Search"
      />
    </div>

    {/* <!-- Options  --> */}
    <ul class="flex max-h-44 flex-col overflow-y-auto">
      <li
        class="hidden px-4 py-2 text-sm text-on-surface"
        x-ref="noResultsMessage"
      >
        <span>No matches found</span>
      </li>
      <template x-for="(item, index) in options" x-bind:key="item.label">
        <li
          class="combobox-option inline-flex justify-between gap-6 bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-surface hover:text-on-surface-strong focus-visible:bg-surface-dark-alt/5 focus-visible:text-on-surface-strong focus-visible:outline-hidden cursor-pointer"
          x-on:click="setSelectedOption(item)"
          x-bind:id="'option-' + index"
          tabindex={0}
        >
          <div class="flex items-center gap-2">
            <img
              class="w-5 h-3.5"
              x-bind:src="'https://flagcdn.com/' + item.iso + '.svg'"
            />
            <span
              x-bind:class="selectedOption == item ? 'font-bold' : null"
              x-text="item.label"
            ></span>
          </div>
          {checkmarkIcon}
        </li>
      </template>
    </ul>
  </div>
);

const checkmarkIcon = (
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

const chevronIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-5"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clip-rule="evenodd"
    />
  </svg>
);
