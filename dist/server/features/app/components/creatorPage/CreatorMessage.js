import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const CreatorMessage = ({
  creator,
  message,
  canReadMessages = true
}) => {
  const redactClass = !canReadMessages ? "select-none blur-[3px] pointer-events-none" : "";
  return /* @__PURE__ */ jsxs("article", { class: "rounded-radius border border-outline bg-surface p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("header", { class: "mb-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("a", { href: `/creators/${creator.slug}`, children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: creator.coverUrl ?? "",
            alt: creator.displayName,
            class: "size-8 rounded-full object-cover"
          }
        ),
        /* @__PURE__ */ jsx("span", { class: "truncate text-sm font-medium text-on-surface-strong", children: creator.displayName })
      ] }) }),
      /* @__PURE__ */ jsx("time", { class: "shrink-0 text-xs text-on-surface", children: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : "" })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "relative", children: [
      /* @__PURE__ */ jsxs("div", { class: redactClass, children: [
        /* @__PURE__ */ jsx("p", { class: "whitespace-pre-wrap text-sm text-on-surface", children: message.body }),
        message.imageUrl && /* @__PURE__ */ jsx("div", { class: "mt-3", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: message.imageUrl,
            alt: "Post image",
            class: "w-full rounded-radius object-cover border border-outline",
            loading: "lazy"
          }
        ) })
      ] }),
      !canReadMessages && /* @__PURE__ */ jsx("div", { class: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsx("div", { class: "rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm", children: "Follow to unlock" }) })
    ] })
  ] });
};
var CreatorMessage_default = CreatorMessage;
export {
  CreatorMessage_default as default
};
