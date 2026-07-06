import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { fadeTransition } from "../../lib/transitions.js";
import InputLabel from "./InputLabel.js";
const Select = ({ label, options, required = false, name }) => {
  return /* @__PURE__ */ jsxs("div", { class: "relative flex w-full max-w-xs flex-col gap-0 text-on-surface dark:text-on-surface-dark", children: [
    /* @__PURE__ */ jsx(InputLabel, { label, name, required }),
    chevronIcon,
    /* @__PURE__ */ jsxs(
      "select",
      {
        id: name,
        name: name.replace("form.", ""),
        "x-model": name,
        class: "w-full appearance-none rounded-radius border border-outline bg-surface px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-75",
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Select..." }),
          options.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }))
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "p",
      {
        class: "text-error text-sm mt-1",
        "x-show": `errors && errors.${name}`,
        "x-text": `errors && errors.${name}`,
        ...fadeTransition
      }
    )
  ] });
};
var Select_default = Select;
const chevronIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "absolute pointer-events-none right-4 top-11 size-5",
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
export {
  Select_default as default
};
