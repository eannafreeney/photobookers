import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { capitalize } from "../../utils.js";
import { tagBooksUrl } from "../../lib/tags.js";
import Badge from "./Badge.js";
import Link from "./Link.js";
const TagList = ({ tags }) => {
  if (tags.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { className: "flex items-center flex-wrap gap-2", children: tags.map((tag) => /* @__PURE__ */ jsx(Link, { href: tagBooksUrl(tag), children: /* @__PURE__ */ jsx(Badge, { variant: "default", children: capitalize(tag) }) })) });
};
var TagList_default = TagList;
export {
  TagList_default as default
};
