import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import CreatorsSlider from "../components/CreatorsSlider.js";
import { getTopCreatorsByViews } from "../../creator-views/services.js";
const TRENDING_CREATORS_LIMIT = 20;
const CreatorsSliderFragment = async () => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);
  if (err || !creators || creators.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { id: "creators-slider-fragment", children: /* @__PURE__ */ jsx(CreatorsSlider, { creators }) });
};
var CreatorsSliderFragment_default = CreatorsSliderFragment;
export {
  CreatorsSliderFragment_default as default
};
