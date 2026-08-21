import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import Button from "../../../components/app/Button.js";
import PromotedListCard from "../../../features/app/components/PromotedListCard.js";
import { getPromotedLists } from "../../../domain/lists/services.js";
const GET = createRoute(async (c) => {
  const [error, lists] = await getPromotedLists(8);
  if (error || !lists?.length) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "lists-fragment", children: [
      /* @__PURE__ */ jsx(SectionHeader, { kicker: "From collectors", action: /* @__PURE__ */ jsx(ViewAllLink, { href: "/lists" }), children: "Lists" }),
      /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex min-w-max items-stretch gap-4 pr-4", children: lists.map((list) => /* @__PURE__ */ jsx(PromotedListCard, { list })) }) }),
      /* @__PURE__ */ jsx("div", { class: "mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/lists", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Lists \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
