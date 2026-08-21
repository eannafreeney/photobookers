import { jsx } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import FormDelete from "../../../components/forms/FormDelete.js";
const DeleteRowButton = ({ action, confirm, ...alpineAttrs }) => {
  return /* @__PURE__ */ jsx(
    FormDelete,
    {
      action,
      ...{
        "x-target": "toast",
        "x-target.error": "toast",
        ...alpineAttrs,
        "@ajax:before": `confirm(${JSON.stringify(confirm)}) || $event.preventDefault()`
      },
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", width: "fit", children: "Delete" })
    }
  );
};
var DeleteRowButton_default = DeleteRowButton;
export {
  DeleteRowButton_default as default
};
