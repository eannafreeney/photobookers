import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatOrdinalDate, toWeekString } from "../../../lib/utils.js";
const FeaturedPageHeader = ({
  title,
  name,
  weekStart,
  date,
  location
}) => {
  const when = date ? formatOrdinalDate(date) : weekStart ? toWeekString(weekStart) : null;
  const meta = [location, when].filter(Boolean).join(" \xB7 ");
  return /* @__PURE__ */ jsxs("header", { class: "flex flex-col items-center gap-3 text-center border-b-2 border-on-surface-strong pb-6", children: [
    /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: title }),
    /* @__PURE__ */ jsx("h1", { class: "m-0 text-balance font-display text-3xl md:text-5xl font-medium leading-tight text-on-surface-strong", children: name }),
    meta ? /* @__PURE__ */ jsx("p", { class: "kicker text-on-surface-weak", children: meta }) : null
  ] });
};
var FeaturedPageHeader_default = FeaturedPageHeader;
export {
  FeaturedPageHeader_default as default
};
