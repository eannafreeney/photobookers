import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Card from "../../../../components/app/Card.js";
import Link from "../../../../components/app/Link.js";
import { formatDate, formatDateWithoutYear } from "../../../../utils.js";
const FairCard = ({ fair }) => {
  const fairPath = `/fairs/${fair.slug}`;
  return /* @__PURE__ */ jsxs(Card, { children: [
    fair.coverUrl && /* @__PURE__ */ jsxs("div", { class: "relative", children: [
      /* @__PURE__ */ jsx(Card.Image, { src: fair.coverUrl, alt: fair.name, href: fairPath }),
      /* @__PURE__ */ jsxs("div", { class: "absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm", children: [
        formatDateWithoutYear(fair.startDate),
        " - ",
        formatDate(fair.endDate)
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card.Body, { children: [
      /* @__PURE__ */ jsx(Link, { href: fairPath, children: /* @__PURE__ */ jsx(Card.Title, { children: fair.name }) }),
      (fair.city || fair.country) && /* @__PURE__ */ jsx("div", { class: "text-sm text-on-surface-weak", children: fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country }),
      fair.venue && /* @__PURE__ */ jsx("div", { class: "text-sm text-on-surface-weak", children: fair.venue })
    ] })
  ] });
};
var FairCard_default = FairCard;
export {
  FairCard_default as default
};
