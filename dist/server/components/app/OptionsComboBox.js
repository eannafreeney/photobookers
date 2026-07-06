import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import InputLabel from "../forms/InputLabel.js";
const OptionsComboBox = ({
  options,
  name,
  label = "Creator",
  required,
  initialSelectedId,
  multiple = false
}) => {
  const fieldName = name.replace("form.", "");
  const alpineConfig = JSON.stringify({
    multiple,
    initialSelectedId: initialSelectedId ?? ""
  });
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": `optionsComboBox(${JSON.stringify(options)}, ${JSON.stringify(fieldName)}, ${alpineConfig})`,
      class: "w-full flex flex-col gap-1",
      ...{
        "x-on:click.outside": "isOpen = false",
        "x-effect": "isOpen && $nextTick(() => $refs.searchField?.focus())"
      },
      children: /* @__PURE__ */ jsxs("div", { class: "relative", children: [
        /* @__PURE__ */ jsxs("fieldset", { class: "grid gap-1.5 text-xs grid-cols-1 auto-rows-max", children: [
          /* @__PURE__ */ jsx(InputLabel, { label, name, required }),
          /* @__PURE__ */ jsxs("label", { class: "bg-surface-alt -mb-1 rounded-radius border border-outline text-on-surface-alt flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                "x-on:click": "isOpen = !isOpen",
                class: "w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal text-left focus:outline-none",
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      class: "inline-flex items-center gap-1.5",
                      "x-show": "!hasSelection()",
                      children: "Please Select"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "span",
                    {
                      class: "inline-flex items-center gap-1.5",
                      "x-show": "!multiple && selectedOption",
                      "x-cloak": true,
                      children: [
                        /* @__PURE__ */ jsx("span", { "x-text": "selectedOption?.label" }),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            "x-show": "selectedOption?.verified",
                            title: "Verified Creator",
                            class: "inline-flex",
                            children: verifiedBadgeIcon
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      class: "inline-flex items-center gap-1.5",
                      "x-show": "multiple && hasSelection()",
                      "x-cloak": true,
                      children: /* @__PURE__ */ jsx("span", { "x-text": "selectedLabel()" })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                ...{
                  "x-cloak": "true",
                  "x-show": "hasSelection()",
                  "x-on:click.stop": "clearSelection()"
                },
                class: "text-on-surface-alt hover:text-on-surface focus:outline-none",
                children: clearIcon
              }
            ),
            chevronIcon
          ] })
        ] }),
        multiple ? /* @__PURE__ */ jsx(
          "template",
          {
            "x-for": "option in selectedOptions",
            "x-bind:key": "option.id",
            children: /* @__PURE__ */ jsx("input", { type: "hidden", name: fieldName, "x-bind:value": "option.id" })
          }
        ) : /* @__PURE__ */ jsx(
          "input",
          {
            id: name,
            name: fieldName,
            type: "text",
            "x-ref": "hiddenTextField",
            hidden: true
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            class: "absolute left-0 top-16 z-10 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt",
            ...{
              "x-show": "isOpen",
              "x-on:click.outside": "isOpen = false",
              "x-transition": ""
            },
            children: [
              /* @__PURE__ */ jsxs("div", { class: "relative", children: [
                searchIcon,
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    class: "w-full border-b border-outline bg-surface-alt py-2.5 pl-11 pr-4 text-sm text-on-surface focus:outline-hidden focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-75 dark:border-outline-dark dark:bg-surface-dark-alt dark:text-on-surface-dark dark:focus-visible:border-primary-dark",
                    name: "searchField",
                    "x-on:input": "getFilteredOptions($el.value)",
                    "x-ref": "searchField",
                    placeholder: "Search"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("ul", { class: "flex max-h-88 w-full flex-col overflow-hidden overflow-y-auto border-outline bg-surface-alt py-1.5 rounded-radius border", children: [
                /* @__PURE__ */ jsx(
                  "li",
                  {
                    class: "hidden px-4 py-2 text-sm text-on-surface",
                    "x-ref": "noResultsMessage",
                    children: /* @__PURE__ */ jsx("span", { children: "No matches found" })
                  }
                ),
                /* @__PURE__ */ jsx("template", { "x-for": "(item, index) in options", "x-bind:key": "index", children: /* @__PURE__ */ jsxs(
                  "li",
                  {
                    class: "combobox-option cursor-pointer inline-flex justify-between items-center gap-6 bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-primary/10 hover:text-on-surface-strong focus-visible:bg-primary/10 focus-visible:text-on-surface-strong focus-visible:outline-primary focus-visible:outline-offset-1 focus-visible:outline rounded-radius",
                    tabindex: 0,
                    "x-on:click": "handleOptionClick(item)",
                    ...{
                      "x-on:keydown.enter": "handleOptionClick(item)",
                      "x-bind:id": "'option-' + index"
                    },
                    children: [
                      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx(
                          "img",
                          {
                            class: "size-8 rounded-full",
                            "x-bind:src": "item.img",
                            alt: "Creator avatar"
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { class: "flex flex-col", children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center gap-1.5", children: [
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              "x-bind:class": "isOptionHighlighted(item) ? 'font-bold' : null",
                              "x-text": "item.label"
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              "x-show": "item.verified",
                              title: "Verified Creator",
                              class: "inline-flex",
                              children: verifiedBadgeIcon
                            }
                          )
                        ] }) })
                      ] }),
                      multiple ? multiIconCheck : iconCheck
                    ]
                  }
                ) })
              ] })
            ]
          }
        )
      ] })
    }
  );
};
var OptionsComboBox_default = OptionsComboBox;
const clearIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-4",
    children: /* @__PURE__ */ jsx("path", { d: "M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" })
  }
);
const verifiedBadgeIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    class: "size-4",
    "aria-hidden": "true",
    children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", fill: "#3b82f6" }),
      /* @__PURE__ */ jsx(
        "path",
        {
          fill: "none",
          stroke: "white",
          "stroke-width": "2.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M7.5 12l3 3 6-6"
        }
      )
    ]
  }
);
const chevronIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-5",
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
const searchIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "1.5",
    class: "absolute left-4 top-1/2 size-5 -translate-y-1/2 text-on-surface/50 dark:text-on-surface-dark/50",
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
const iconCheck = /* @__PURE__ */ jsx(
  "svg",
  {
    "x-cloak": true,
    "x-show": "isOptionHighlighted(item)",
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
const multiIconCheck = /* @__PURE__ */ jsx(
  "svg",
  {
    "x-cloak": true,
    "x-show": "isOptionHighlighted(item)",
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
export {
  OptionsComboBox_default as default
};
