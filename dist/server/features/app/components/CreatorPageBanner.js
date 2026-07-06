import { Fragment, jsx } from "hono/jsx/jsx-runtime";
const CreatorPageBanner = ({ bannerUrl, displayName }) => {
  if (!bannerUrl) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { class: "w-full overflow-hidden border border-outline", children: /* @__PURE__ */ jsx(
    "img",
    {
      src: bannerUrl,
      alt: `${displayName} banner`,
      class: "w-full h-48 md:h-72 object-cover"
    }
  ) });
};
var CreatorPageBanner_default = CreatorPageBanner;
export {
  CreatorPageBanner_default as default
};
