import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Card from "../../../../components/app/Card.js";
import Link from "../../../../components/app/Link.js";
import { resolveStoreCoverUrl } from "../coverUrl.js";
const StoreCard = ({ store }) => {
  const storePath = `/stores/${store.slug}`;
  const coverUrl = resolveStoreCoverUrl(store);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(Card.Image, { src: coverUrl, alt: store.name, href: storePath }),
    /* @__PURE__ */ jsxs(Card.Body, { children: [
      /* @__PURE__ */ jsx(Link, { href: storePath, children: /* @__PURE__ */ jsx(Card.Title, { children: store.name }) }),
      /* @__PURE__ */ jsxs("div", { class: "text-sm text-on-surface-weak", children: [
        store.city,
        ", ",
        store.country
      ] }),
      /* @__PURE__ */ jsx("div", { class: "text-sm text-on-surface-weak line-clamp-2", children: store.address })
    ] })
  ] });
};
var StoreCard_default = StoreCard;
export {
  StoreCard_default as default
};
