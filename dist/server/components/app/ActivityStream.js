import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      MobileActivityItem,
      {
        currentUserId,
        bgColor: infoVariant.bg,
        alpineAttrs
      }
    ),
    /* @__PURE__ */ jsx(
      DesktopActivityItem,
      {
        alpineAttrs,
        currentUserId,
        bgColor: infoVariant.bg,
        borderColor: infoVariant.border
      }
    )
  ] });
};
var ActivityStream_default = ActivityStream;
const MobileActivityItem = ({
  currentUserId,
  bgColor,
  alpineAttrs
}) => /* @__PURE__ */ jsxs(
  "div",
  {
    ...alpineAttrs,
    "data-current-user-id": currentUserId ?? "",
    class: `fixed bottom-4 right-4 left-4 z-50 sm:hidden ${bgColor}`,
    children: [
      /* @__PURE__ */ jsx("template", { "x-if": "activeItem", children: /* @__PURE__ */ jsx("div", { class: "list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong", children: /* @__PURE__ */ jsxs(
        "a",
        {
          "x-bind:href": "activeItem.targetUrl || '#'",
          class: "flex w-full items-center gap-2 p-2",
          children: [
            /* @__PURE__ */ jsx("template", { "x-if": "activeItem.targetImageUrl", children: /* @__PURE__ */ jsx(
              "img",
              {
                "x-bind:src": "activeItem.targetImageUrl",
                "x-bind:alt": "activeItem.targetName",
                class: "size-10 rounded object-cover shrink-0",
                loading: "lazy"
              }
            ) }),
            /* @__PURE__ */ jsx("template", { "x-if": "!activeItem.targetImageUrl", children: /* @__PURE__ */ jsx("div", { class: "size-10 rounded bg-slate-300/40 shrink-0" }) }),
            /* @__PURE__ */ jsxs("p", { class: "text-sm font-medium tracking-wider min-w-0", children: [
              /* @__PURE__ */ jsx("span", { "x-text": "activeItem.leadingText" }),
              /* @__PURE__ */ jsx("strong", { "x-text": "activeItem.targetName" }),
              /* @__PURE__ */ jsx("template", { "x-if": "activeItem.targetCreatorName", children: /* @__PURE__ */ jsxs("span", { children: [
                " ",
                "by ",
                /* @__PURE__ */ jsx("span", { "x-text": "activeItem.targetCreatorName" })
              ] }) }),
              /* @__PURE__ */ jsx("span", { "x-text": "activeItem.trailingText" })
            ] })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx("template", { "x-if": "pendingCount > 0", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          class: "mt-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-on-surface shadow",
          "x-on:click": "showNextMobile()",
          "x-text": "`+${pendingCount}`"
        }
      ) })
    ]
  }
);
const DesktopActivityItem = ({
  alpineAttrs,
  currentUserId,
  bgColor,
  borderColor
}) => /* @__PURE__ */ jsx(
  "ul",
  {
    ...alpineAttrs,
    "data-current-user-id": currentUserId ?? "",
    class: "fixed bottom-4 right-4 left-4 z-50 hidden sm:flex w-[calc(100vw-2rem)] flex-col gap-2",
    children: /* @__PURE__ */ jsx("template", { "x-for": "item in items", "x-bind:key": "item.id", children: /* @__PURE__ */ jsx(
      "li",
      {
        class: `list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong ${borderColor}`,
        children: /* @__PURE__ */ jsxs(
          "a",
          {
            "x-bind:href": "item.targetUrl || '#'",
            class: `flex w-full items-center gap-2 p-2 ${bgColor}`,
            children: [
              /* @__PURE__ */ jsx("template", { "x-if": "item.targetImageUrl", children: /* @__PURE__ */ jsx(
                "img",
                {
                  "x-bind:src": "item.targetImageUrl",
                  "x-bind:alt": "item.targetName",
                  class: "size-10 rounded object-cover shrink-0",
                  loading: "lazy"
                }
              ) }),
              /* @__PURE__ */ jsx("template", { "x-if": "!item.targetImageUrl", children: /* @__PURE__ */ jsx("div", { class: "size-10 rounded bg-slate-300/40 shrink-0" }) }),
              /* @__PURE__ */ jsxs("p", { class: "text-sm font-medium tracking-wider", children: [
                /* @__PURE__ */ jsx("span", { "x-text": "item.leadingText" }),
                /* @__PURE__ */ jsx("strong", { "x-text": "item.targetName" }),
                /* @__PURE__ */ jsx("template", { "x-if": "item.targetCreatorName", children: /* @__PURE__ */ jsxs("span", { children: [
                  " ",
                  "by ",
                  /* @__PURE__ */ jsx("span", { "x-text": "item.targetCreatorName" })
                ] }) }),
                /* @__PURE__ */ jsx("span", { "x-text": "item.trailingText" })
              ] })
            ]
          }
        )
      }
    ) })
  }
);
export {
  ActivityStream_default as default
};
