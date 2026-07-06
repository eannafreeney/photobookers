import { jsx } from "hono/jsx/jsx-runtime";
import CreatorsCircle from "./CreatorsCircle.js";
const CreatorsSlider = async ({ creators }) => {
  return /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex w-max items-center gap-3", children: creators.map((creator) => /* @__PURE__ */ jsx(CreatorsCircle, { creator, size: 24 }, creator.id)) }) });
};
var CreatorsSlider_default = CreatorsSlider;
export {
  CreatorsSlider_default as default
};
