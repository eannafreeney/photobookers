import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import SpotlightCreator from "./SpotlightCreator.js";
const SpotlightCreatorLink = ({ creator, role }) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-3 border-y border-outline py-4", children: [
    /* @__PURE__ */ jsx(SpotlightCreator, { creator, role }),
    /* @__PURE__ */ jsx("a", { href: `/creators/${creator.slug}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: "Visit" }) })
  ] });
};
var SpotlightCreatorLink_default = SpotlightCreatorLink;
export {
  SpotlightCreatorLink_default as default
};
