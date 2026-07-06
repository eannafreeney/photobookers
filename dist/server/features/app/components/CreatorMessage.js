import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormDelete from "../../../components/forms/FormDelete.js";
const CreatorMessage = ({
  creator,
  message,
  isFollower,
  isFirst,
  user
}) => {
  const canDelete = user?.isAdmin || user?.creator?.id === creator.id;
  const redactClass = !isFollower ? "select-none blur-[3px] pointer-events-none" : "";
  return /* @__PURE__ */ jsxs(
    "article",
    {
      class: "rounded-radius border border-outline bg-surface p-4 shadow-sm",
      "x-data": `{ isExpanded: ${isFirst ? "true" : "false"} }`,
      children: [
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
          /* @__PURE__ */ jsx("time", { class: "shrink-0 text-xs text-on-surface", children: message.createdAt ? new Date(message.createdAt).toLocaleDateString() : "" }),
          canDelete && /* @__PURE__ */ jsx(
            FormDelete,
            {
              action: `/dashboard/messages/${creator.id}/${message.id}`,
              ...{
                "x-target": "toast",
                "@ajax:before": "confirm('Delete this post?') || $event.preventDefault()",
                "@ajax:success": "$el.closest('article').remove()"
              },
              children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  class: "shrink-0 text-xs text-danger hover:opacity-75 transition cursor-pointer",
                  children: "Delete"
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "relative", children: [
          /* @__PURE__ */ jsxs("div", { class: redactClass, children: [
            /* @__PURE__ */ jsx(
              "p",
              {
                class: "whitespace-pre-wrap text-sm text-on-surface line-clamp-2",
                "x-show": "!isExpanded",
                children: message.body
              }
            ),
            /* @__PURE__ */ jsxs("div", { "x-cloak": true, "x-show": "isExpanded", "x-collapse": true, children: [
              /* @__PURE__ */ jsx("p", { class: "whitespace-pre-wrap text-sm text-on-surface", children: message.body }),
              message.imageUrls && message.imageUrls.length > 0 && /* @__PURE__ */ jsx("div", { class: "mt-3 flex flex-col gap-2", children: message.imageUrls.map((url, idx) => /* @__PURE__ */ jsx(
                "a",
                {
                  href: url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class: "block",
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: url,
                      alt: `Post image ${idx + 1}`,
                      class: "w-full rounded-radius object-cover border border-outline",
                      loading: "lazy"
                    }
                  )
                }
              )) })
            ] })
          ] }),
          !isFollower && /* @__PURE__ */ jsx("div", { class: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsx("div", { class: "rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm", children: "Follow to unlock" }) })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            class: "mt-2 flex items-center gap-1 text-xs text-on-surface hover:text-on-surface-strong transition cursor-pointer",
            "x-on:click": "isExpanded = !isExpanded",
            "x-bind:aria-expanded": "isExpanded ? 'true' : 'false'",
            children: [
              /* @__PURE__ */ jsx("span", { "x-text": "isExpanded ? 'Show less' : 'Show more'" }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  "stroke-width": "2",
                  stroke: "currentColor",
                  class: "size-3 transition",
                  "x-bind:class": "isExpanded ? 'rotate-180' : ''",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      d: "M19.5 8.25l-7.5 7.5-7.5-7.5"
                    }
                  )
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var CreatorMessage_default = CreatorMessage;
export {
  CreatorMessage_default as default
};
