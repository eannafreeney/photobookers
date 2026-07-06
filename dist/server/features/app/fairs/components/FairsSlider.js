import { jsx } from "hono/jsx/jsx-runtime";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../../lib/horizontalSliderCardWidth.js";
import FairCard from "./FairCard.js";
const FairsSlider = ({ fairs }) => /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex min-w-max items-stretch gap-4 pr-4", children: fairs.map((fair) => /* @__PURE__ */ jsx("div", { class: HORIZONTAL_SLIDER_CARD_CLASS, children: /* @__PURE__ */ jsx(FairCard, { fair }) })) }) });
var FairsSlider_default = FairsSlider;
export {
  FairsSlider_default as default
};
