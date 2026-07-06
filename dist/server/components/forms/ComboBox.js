import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { fadeTransition } from "../../lib/transitions.js";
import InputLabel from "./InputLabel.js";
const ComboBox = ({
  label,
  name,
  newOptionName,
  options,
  type,
  required = false,
  disableOnInit = true
}) => {
  const alpineAttrs = {
    "x-data": `comboBox(${JSON.stringify(options)}, ${JSON.stringify(type)}, ${disableOnInit})`,
    "x-on:keydown": "handleKeydownOnOptions($event)",
    "x-on:keydown.esc.window": "isOpen = false, openedWithKeyboard = false",
    "x-init": "options = allOptions"
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { class: "flex w-full max-w-xs flex-col gap-1", ...alpineAttrs, children: /* @__PURE__ */ jsxs("fieldset", { class: "grid gap-1.5 py-0 text-xs grid-cols-1 auto-rows-max", children: [
    /* @__PURE__ */ jsx(InputLabel, { label, name, required }),
    /* @__PURE__ */ jsxs("div", { class: "relative", children: [
      /* @__PURE__ */ jsx(TriggerButton, {}),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: name,
          name: name.replace("form.", ""),
          "x-model": name,
          "x-ref": "hiddenTextField",
          hidden: true
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          name: newOptionName.replace("form.", ""),
          "x-model": newOptionName,
          "x-ref": "newOptionNameField",
          hidden: true
        }
      ),
      /* @__PURE__ */ jsx(DropdownList, { name, type: type ?? "artist" })
    ] })
  ] }) }) });
};
var ComboBox_default = ComboBox;
const DropdownList = ({
  name,
  type
}) => {
  const alpineAttrs = {
    "x-show": "isOpen || openedWithKeyboard",
    "x-on:click.outside": "isOpen = false, openedWithKeyboard = false",
    "x-on:keydown.down.prevent": "$focus.wrap().next()",
    "x-on:keydown.up.prevent": "$focus.wrap().previous()",
    "x-trap": "openedWithKeyboard",
    ...fadeTransition
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "x-cloak": true,
      id: `${name}List`,
      class: "absolute left-0 top-11 z-10 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt ",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsxs("div", { class: "relative", children: [
          searchIcon,
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              class: "w-full border-b border-outline bg-surface-alt py-2.5 pl-11 pr-4 text-base md:text-sm text-on-surface focus:outline-hidden focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-75",
              name: "searchField",
              "x-on:input": "getFilteredOptions($el.value)",
              "x-ref": "searchField",
              placeholder: "Search or Add New..."
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              "x-cloak": true,
              "x-show": "searchQuery",
              "x-on:click": "clearSearch()",
              class: "absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer hover:bg-outline/50",
              children: clearIcon
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("ul", { class: "flex max-h-44 flex-col overflow-y-auto", children: [
          /* @__PURE__ */ jsxs(
            "li",
            {
              class: "px-4 py-2 text-sm cursor-pointer text-primary hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none",
              tabindex: 0,
              ...{
                "x-on:click": "addNewOption()",
                "x-on:keydown.enter.prevent": "addNewOption()",
                "x-ref": "addNewOption",
                "x-show": "searchQuery && !options.some(o => o.label.toLowerCase() === searchQuery.toLowerCase())"
              },
              children: [
                'Add "',
                /* @__PURE__ */ jsx("span", { "x-text": "searchQuery" }),
                '" as new ',
                type
              ]
            }
          ),
          /* @__PURE__ */ jsx("template", { "x-for": "(item, index) in options", "x-bind:key": "item.label", children: /* @__PURE__ */ jsxs(
            "li",
            {
              class: "combobox-option inline-flex justify-between gap-6 bg-surface-alt px-4 py-2 text-sm focus-visible:bg-surface-alt focus-visible:outline-none cursor-pointer hover:bg-surface",
              tabindex: 0,
              ...{
                "x-on:click": `setSelectedOption(item)`,
                "x-on:keydown.enter": `setSelectedOption(item)`,
                "x-bind:id": "'option-' + index"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "x-bind:class": "selectedOption == item ? 'font-bold' : null",
                    "x-text": "item.label"
                  }
                ),
                checkmarkIcon
              ]
            }
          ) })
        ] })
      ]
    }
  );
};
const TriggerButton = () => {
  const alpineAttrs = {
    "x-on:click": "isOpen = ! isOpen; isOpen && $nextTick(() => $refs.searchField.focus())",
    "x-bind:disabled": "isDisabled",
    "x-on:keydown.down.prevent": "openedWithKeyboard = true",
    "x-on:keydown.enter.prevent": "openedWithKeyboard = true"
  };
  return /* @__PURE__ */ jsx(
    "label",
    {
      class: "w-full cursor-pointer",
      "x-bind:class": "isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'",
      children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          class: "flex w-full items-center justify-between text-base md:text-sm font-normal border-outline border bg-surface-alt px-2 py-2",
          ...alpineAttrs,
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                class: "text-base md:text-sm font-normal",
                "x-text": "selectedOption ? selectedOption.label : 'Please Select'"
              }
            ),
            /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  "x-cloak": true,
                  "x-show": "selectedOption && !isDisabled",
                  ...{ "x-on:click.stop": "clearSelection()" },
                  class: "p-0.5 rounded hover:bg-outline/50 cursor-pointer",
                  children: clearIcon
                }
              ),
              chevronIcon
            ] })
          ]
        }
      )
    }
  );
};
const searchIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "1.5",
    class: "absolute left-4 top-1/2 size-5 -translate-y-1/2 text-on-surface/50",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      }
    )
  }
);
const chevronIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-5",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "fill-rule": "evenodd",
        d: "M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z",
        "clip-rule": "evenodd"
      }
    )
  }
);
const checkmarkIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    "x-cloak": true,
    "x-show": "selectedOption == item",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "2",
    class: "size-4",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "m4.5 12.75 6 6 9-13.5"
      }
    )
  }
);
const clearIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-4",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" })
  }
);
export {
  ComboBox_default as default
};
