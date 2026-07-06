import { jsx } from "hono/jsx/jsx-runtime";
const ScheduleButton = ({ href, text }) => /* @__PURE__ */ jsx(
  "a",
  {
    href,
    "x-target": "modal-root",
    class: "flex min-h-16 flex-col items-center justify-center rounded border border-dashed border-outline bg-surface-alt/50 py-4 text-sm font-medium text-on-surface hover:border-outline-strong hover:bg-surface-alt hover:text-on-surface",
    children: text
  }
);
var ScheduleButton_default = ScheduleButton;
export {
  ScheduleButton_default as default
};
