import { fadeTransition } from "../../../lib/transitions";
import InputLabel from "./InputLabel";

type ComboBoxProps = {
  label: string;
  name: string;
  newOptionName: string;
  options: any[];
  required?: boolean;
};

const ComboBox = ({
  label,
  name,
  newOptionName,
  options,
  required = false,
}: ComboBoxProps) => {
  return (
    <>
      <div
        x-data={`comboBox(${JSON.stringify(options)})`}
        class="flex w-full max-w-xs flex-col gap-1"
        {...{
          "x-on:keydown": "handleKeydownOnOptions($event)",
          "x-on:keydown.esc.window":
            "isOpen = false, openedWithKeyboard = false",
        }}
        x-init="options = allOptions"
      >
        <fieldset class="fieldset py-0">
          <InputLabel label={label} name={name} required={required} />
          <div class="relative">
            {/* <!-- trigger button  --> */}
            <TriggerButton />

            {/* <!-- Hidden Input To Grab The Selected Value  --> */}
            <input
              id={name}
              name={name.replace("form.", "")}
              x-model={name}
              x-ref="hiddenTextField"
              hidden
            />
            {/* <!-- Hidden Input for new artist name when user adds a new option --> */}
            <input
              name={newOptionName.replace("form.", "")}
              x-model={newOptionName}
              x-ref="newOptionNameField"
              hidden
            />
            <DropdownList name={name} />
          </div>
        </fieldset>
      </div>
    </>
  );
};

export default ComboBox;

const DropdownList = ({ name }: { name: string }) => {
  return (
    <div
      x-cloak
      x-show="isOpen || openedWithKeyboard"
      id={`${name}List`}
      class="absolute left-0 top-11 z-10 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt "
      {...{
        "x-on:click.outside": "isOpen = false, openedWithKeyboard = false",
        "x-on:keydown.down.prevent": "$focus.wrap().next()",
        "x-on:keydown.up.prevent": "$focus.wrap().previous()",
      }}
      x-trap="openedWithKeyboard"
      {...fadeTransition}
    >
      {/* <!-- Search  --> */}
      <label class="input w-full rounded-none ">
        {/* <div class="relative"> */}
        {searchIcon}
        <input
          type="text"
          class="w-full border-b border-outline bg-surface-alt py-2.5 pl-11 pr-4 text-sm text-on-surface focus:outline-hidden focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-75 "
          name="searchField"
          x-on:input="getFilteredOptions($el.value)"
          x-ref="searchField"
          placeholder="Search"
        />
        <span
          x-cloak
          x-show="searchQuery"
          x-on:click="clearSearch()"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer hover:bg-outline/50"
        >
          {clearIcon}
        </span>
      </label>

      {/* <!-- Options  --> */}
      <ul class="flex max-h-44 flex-col overflow-y-auto">
        <li
          x-show="options.length === 0 && searchQuery"
          x-ref="addNewOption"
          class="px-4 py-2 text-sm cursor-pointer text-primary hover:bg-base-200 focus-visible:bg-base-200 focus-visible:outline-none"
          tabindex={0}
          x-on:click="addNewOption()"
          {...{ "x-on:keydown.enter.prevent": "addNewOption()" }}
        >
          Add "<span x-text="searchQuery"></span>"
        </li>

        <template x-for="(item, index) in options" x-bind:key="item.label">
          <li
            class="combobox-option inline-flex justify-between gap-6 bg-surface-alt px-4 py-2 text-sm focus-visible:bg-surface-alt focus-visible:outline-none cursor-pointer hover:bg-surface"
            x-on:click="setSelectedOption(item)"
            {...{
              "x-on:keydown.enter": "setSelectedOption(item)",
            }}
            x-bind:id="'option-' + index"
            tabindex={0}
          >
            {/* <!-- Label  --> */}
            <span
              x-bind:class="selectedOption == item ? 'font-bold' : null"
              x-text="item.label"
            ></span>
            {/* <!-- Screen reader 'selected' indicator  --> */}
            <span
              class="sr-only"
              x-text="selectedOption == item ? 'selected' : null"
            ></span>
            {checkmarkIcon}
          </li>
        </template>
      </ul>
    </div>
  );
};

const TriggerButton = () => {
  return (
    <label
      class="w-full cursor-pointer"
      x-bind:class="isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between text-sm font-normal border-outline border bg-surface-alt px-2 py-2"
        x-on:click="isOpen = ! isOpen"
        x-bind:disabled="isDisabled"
        {...{
          "x-on:keydown.down.prevent": "openedWithKeyboard = true",
          "x-on:keydown.enter.prevent": "openedWithKeyboard = true",
        }}
      >
        <span
          class="text-sm font-normal"
          x-text="selectedOption ? selectedOption.label : 'Please Select'"
        ></span>
        <div class="flex items-center gap-1">
          <span
            x-cloak
            x-show="selectedOption && !isDisabled"
            {...{ "x-on:click.stop": "clearSelection()" }}
            class="p-0.5 rounded hover:bg-outline/50 cursor-pointer"
          >
            {clearIcon}
          </span>
          {chevronIcon}
        </div>
      </button>
    </label>
  );
};

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="1.5"
    class="size-5 opacity-50"
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

const clearIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);
