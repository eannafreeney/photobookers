import { User } from "../../db/schema";

const CreatorsComboBox = ({ users }: { users: User[] }) => {
  const options = users.map((user) => ({
    id: user.id,
    label: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
    value: user.email,
    img: null,
  }));

  return (
    <div
      x-data={`{
        options: ${JSON.stringify(options)},
        isOpen: false,
        selectedOption: null,
        setSelectedOption(option) {
            this.selectedOption = option
            this.isOpen = false
            this.$refs.hiddenTextField.value = option.id
        },
        highlightFirstMatchingOption(pressedKey) {
            const option = this.options.find((item) =>
                item.label.toLowerCase().startsWith(pressedKey.toLowerCase()),
            )
            if (option) {
                const index = this.options.indexOf(option)
                const allOptions = document.querySelectorAll('.combobox-option')
                if (allOptions[index]) {
                    allOptions[index].focus()
                }
            }
        },
    }`}
      class="w-full max-w-xs flex flex-col gap-1"
      x-on:keydown="highlightFirstMatchingOption($event.key)"
    >
      <div class="relative">
        <button
          type="button"
          x-on:click="isOpen = !isOpen"
          class="inline-flex w-full items-center justify-between gap-2 whitespace-nowrap border-outline bg-surface-alt px-4 py-2 text-sm font-medium capitalize tracking-wide text-on-surface transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-outline-dark dark:bg-surface-dark-alt/50 dark:text-on-surface-dark dark:focus-visible:outline-primary-dark rounded-radius border"
        >
          <span
            class="text-sm font-normal"
            x-text="selectedOption ? selectedOption.value : 'Please Select'"
          ></span>
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
        </button>

        <input
          id="user"
          name="user"
          type="text"
          x-ref="hiddenTextField"
          hidden
        />
        <ul
          x-cloak
          x-show="isOpen"
          id="usersList"
          class="absolute z-10 left-0 top-11 flex max-h-44 w-full flex-col overflow-hidden overflow-y-auto border-outline bg-surface-alt py-1.5 rounded-radius border"
        >
          <template x-for="(item, index) in options" x-bind:key="item.id">
            <li
              //   class="combobox-option inline-flex justify-between items-center gap-6 bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-primary/10 hover:text-on-surface-strong focus-visible:bg-surface-dark-alt/5 focus-visible:text-on-surface-strong focus-visible:outline-hidden cursor-pointer"
              class="combobox-option cursor-pointer inline-flex justify-between items-center gap-6 bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-primary/10 hover:text-on-surface-strong focus-visible:bg-primary/10 focus-visible:text-on-surface-strong focus-visible:outline-primary focus-visible:outline-offset-1 focus-visible:outline rounded-radius"
              tabindex={0}
              x-on:click="setSelectedOption(item)"
              {...{
                "x-on:keydown.enter": "setSelectedOption(item)",
                "x-bind:id": "'option-' + index",
              }}
            >
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <span
                    x-bind:class="selectedOption == item ? 'font-bold' : null"
                    x-text="item.label"
                  ></span>
                  <span class="text-xs" x-text="item.value"></span>
                </div>
              </div>
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
            </li>
          </template>
        </ul>
      </div>
    </div>
  );
};

export default CreatorsComboBox;
