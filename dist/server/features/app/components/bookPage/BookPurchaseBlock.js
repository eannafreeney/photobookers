import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import Link from "../../../../components/app/Link.js";
import { getBookPurchaseAction } from "../../bookPurchase.js";
const stickyBarClass = "fixed inset-x-0 z-[90] border-t border-on-surface-strong bg-surface px-4 py-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0";
const BookPurchaseBlock = ({
  bookSlug,
  purchaseLink,
  availabilityStatus,
  artistName,
  publisherName,
  trackOutbound = true,
  sticky = false
}) => {
  const action = getBookPurchaseAction({
    availabilityStatus,
    purchaseLink,
    artistName,
    publisherName,
    bookSlug,
    trackOutbound
  });
  if (action.kind === "none") return null;
  if (action.kind !== "buy") {
    const status = /* @__PURE__ */ jsx(
      "p",
      {
        class: `kicker ${action.kind === "sold_out" ? "text-danger" : "text-warning"}`,
        children: action.kind === "sold_out" ? "Sold out" : "Not currently for sale"
      }
    );
    if (!sticky) return status;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { class: stickyBarClass, children: status }),
      /* @__PURE__ */ jsx("div", { class: "h-20", "aria-hidden": "true" })
    ] });
  }
  const button = /* @__PURE__ */ jsx(
    Link,
    {
      href: action.href,
      target: "_blank",
      className: sticky ? "block w-full" : void 0,
      children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "solid",
          color: "accent",
          width: sticky ? "full" : "fit",
          type: "button",
          children: /* @__PURE__ */ jsx("span", { children: action.label })
        }
      )
    }
  );
  if (!sticky) return /* @__PURE__ */ jsx("div", { children: button });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { class: stickyBarClass, children: button }),
    /* @__PURE__ */ jsx("div", { class: "h-20", "aria-hidden": "true" })
  ] });
};
var BookPurchaseBlock_default = BookPurchaseBlock;
export {
  BookPurchaseBlock_default as default
};
