import { jsx } from "hono/jsx/jsx-runtime";
const EditSpotlightBlurbButton = ({ href }) => /* @__PURE__ */ jsx(
  "a",
  {
    href,
    "x-target": "modal-root",
    class: "rounded border border-outline bg-surface-alt px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface",
    children: "Edit blurb"
  }
);
var EditSpotlightBlurbButton_default = EditSpotlightBlurbButton;
export {
  EditSpotlightBlurbButton_default as default
};
