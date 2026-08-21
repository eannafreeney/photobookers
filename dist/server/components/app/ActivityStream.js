import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const ActivityStream = ({ currentUserId }) => {
  const alpineAttrs = {
    "x-data": "activityFeed",
    "x-init": "connect()",
    "x-on:beforeunload.window": "disconnect()"
  };
  const infoVariant = {
    border: "border-sky-700",
    bg: "bg-info/10"
  };
  return /* @__PURE__ */ jsxs("div", { ...alpineAttrs, "data-current-user-id": currentUserId ?? "", children: [
    /* @__PURE__ */ jsx(
      ActivityToast,
      {
        bgColor: infoVariant.bg,
        borderColor: infoVariant.border,
        className: "fixed bottom-4 right-4 left-4 z-50 sm:hidden"
      }
    ),
    /* @__PURE__ */ jsx(
      ActivityToast,
      {
        bgColor: infoVariant.bg,
        borderColor: infoVariant.border,
        className: "fixed bottom-4 right-4 z-40 hidden max-w-md sm:block"
      }
    )
  ] });
};
var ActivityStream_default = ActivityStream;
const ActivityToast = ({
  bgColor,
  borderColor,
  className
}) => /* @__PURE__ */ jsxs("div", { class: className, children: [
  /* @__PURE__ */ jsx("template", { "x-if": "activeItem", children: /* @__PURE__ */ jsx(
    "div",
    {
      class: `list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong ${borderColor}`,
      children: /* @__PURE__ */ jsxs(
        "a",
        {
          "x-bind:href": "activeItem.targetUrl || '#'",
          class: `flex w-full items-center gap-2 p-2 ${bgColor}`,
          children: [
            /* @__PURE__ */ jsx("template", { "x-if": "activeItem.targetImageUrl", children: /* @__PURE__ */ jsx(
              "img",
              {
                "x-bind:src": "activeItem.targetImageUrl",
                "x-bind:alt": "activeItem.targetName",
                class: "size-10 shrink-0 rounded object-cover",
                loading: "lazy"
              }
            ) }),
            /* @__PURE__ */ jsxs("p", { class: "min-w-0 text-sm font-medium tracking-wider", children: [
              /* @__PURE__ */ jsx("strong", { "x-text": "activeItem.targetName" }),
              " ",
              "was ",
              /* @__PURE__ */ jsx("span", { "x-text": "verb(activeItem.type)" }),
              " by",
              " ",
              /* @__PURE__ */ jsx("strong", { "x-text": "activeItem.actorName" })
            ] })
          ]
        }
      )
    }
  ) }),
  /* @__PURE__ */ jsx("template", { "x-if": "pendingCount > 0", children: /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      class: "mt-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-on-surface shadow",
      "x-on:click": "dismissActive()",
      "x-text": "`+${pendingCount}`"
    }
  ) })
] });
export {
  ActivityStream_default as default
};
