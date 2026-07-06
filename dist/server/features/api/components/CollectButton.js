import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { findCollectionItem } from "../../../db/queries.js";
import { canCollectBook } from "../../../lib/permissions.js";
import APIButton from "./APIButton.js";
import APIButtonCircle from "./APIButtonCircle.js";
const CollectButton = async ({
  book,
  user,
  isCircleButton = false
}) => {
  let isCollected = false;
  if (user?.id) {
    isCollected = !!await findCollectionItem(user.id, book.id);
  }
  const id = `collect-${book.id}`;
  const isDisabled = !canCollectBook(user, book);
  const buttonIcon = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { "x-show": isCollected ? "isSubmitting" : "!isSubmitting", "x-cloak": true, children: addIcon }),
    /* @__PURE__ */ jsx("span", { "x-show": isCollected ? "!isSubmitting" : "isSubmitting", "x-cloak": true, children: removeIcon })
  ] });
  const props = {
    id,
    action: `/api/books/${book.id}/collect`,
    hiddenInput: { name: "isCollected", value: isCollected },
    buttonText: isCircleButton ? buttonIcon : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: isCollected ? "Collected" : "Collect" }),
      /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: isCollected ? "Collect" : "Collected" }),
      buttonIcon
    ] })
  };
  const tooltipText = isCollected ? "Remove from my Collection" : "Add to my Collection";
  if (isCircleButton) {
    return /* @__PURE__ */ jsx(
      APIButtonCircle,
      {
        ...props,
        buttonType: "circle",
        isDisabled,
        tooltipText
      }
    );
  }
  return /* @__PURE__ */ jsx(APIButton, { ...props, isDisabled });
};
var CollectButton_default = CollectButton;
const addIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "size-5",
    children: [
      /* @__PURE__ */ jsx("path", { d: "M12 5v14" }),
      /* @__PURE__ */ jsx("path", { d: "M5 12h14" })
    ]
  }
);
const removeIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "size-5 text-red-500",
    children: /* @__PURE__ */ jsx("path", { d: "M5 12h14" })
  }
);
export {
  CollectButton_default as default
};
