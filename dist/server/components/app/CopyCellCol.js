import { jsx } from "hono/jsx/jsx-runtime";
import Button from "./Button.js";
const CopyCellCol = ({ entity, buttonWidth = "fit" }) => {
  const escapedEntity = entity.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": `{ cellValue: '${escapedEntity}', copied: false }`,
      class: "flex items-center gap-2",
      "x-on:click": "$dispatch('dialog:close')",
      children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          width: buttonWidth,
          color: "inverse",
          "x-on:click": "copied = !copied; navigator.clipboard.writeText(cellValue)",
          "x-text": "copied ? 'Copied!' : 'Copy'",
          children: "Copy"
        }
      )
    }
  );
};
var CopyCellCol_default = CopyCellCol;
export {
  CopyCellCol_default as default
};
