import { jsx } from "hono/jsx/jsx-runtime";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../../lib/horizontalSliderCardWidth.js";
import StoreCard from "./StoreCard.js";
const StoresSlider = ({ stores }) => /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex min-w-max items-stretch gap-4 pr-4", children: stores.map((store) => /* @__PURE__ */ jsx("div", { class: HORIZONTAL_SLIDER_CARD_CLASS, children: /* @__PURE__ */ jsx(StoreCard, { store }) })) }) });
var StoresSlider_default = StoresSlider;
export {
  StoresSlider_default as default
};
