import { jsx } from "hono/jsx/jsx-runtime";
import { button } from "../../../components/app/Button.js";
const EditRowButton = ({ href, xTarget }) => /* @__PURE__ */ jsx(
  "a",
  {
    href,
    class: button({ variant: "outline", color: "primary", width: "fit" }),
    ...xTarget ? { "x-target": xTarget } : {},
    children: "Edit"
  }
);
var EditRowButton_default = EditRowButton;
export {
  EditRowButton_default as default
};
