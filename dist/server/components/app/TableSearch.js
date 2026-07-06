import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { getInputIcon } from "../../utils.js";
const TableSearch = ({
  target,
  action,
  placeholder,
  isMobile = false
}) => {
  const alpineAttrs = {
    "x-on:input.debounce": "$el.form.requestSubmit()",
    "x-on:search": "$el.form.requestSubmit()"
  };
  return /* @__PURE__ */ jsx("form", { method: "get", "x-target": target, action, autocomplete: "off", children: /* @__PURE__ */ jsxs(
    "label",
    {
      class: clsx(
        "bg-surface rounded-radius border-2 border-outline-strong text-on-surface-strong -mb-1 flex items-center justify-between gap-2 px-3 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-accent",
        isMobile ? "w-full" : "w-64"
      ),
      children: [
        getInputIcon("search"),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "search",
            class: "w-full bg-surface px-2 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 ",
            name: "search",
            placeholder,
            ...alpineAttrs
          }
        )
      ]
    }
  ) });
};
var TableSearch_default = TableSearch;
export {
  TableSearch_default as default
};
