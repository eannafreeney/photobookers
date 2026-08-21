import { jsx } from "hono/jsx/jsx-runtime";
import CreatorsCircle from "./CreatorsCircle.js";
const CreatorsSlider = async ({
  creators,
  user = null,
  followedCreatorIds,
  showFollow = false
}) => {
  return /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex w-max items-start gap-3 pt-1", children: creators.map((creator) => /* @__PURE__ */ jsx(
    CreatorsCircle,
    {
      creator,
      size: 24,
      showFollow,
      user,
      isFollowing: followedCreatorIds?.has(creator.id) ?? false
    },
    creator.id
  )) }) });
};
var CreatorsSlider_default = CreatorsSlider;
export {
  CreatorsSlider_default as default
};
