import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import { shelfProfileUrl } from "../../../lib/share.js";
import { getInitialsAvatar } from "../../../lib/avatar.js";
const ShelfSharingPanel = ({
  user,
  suggestedSlug,
  message,
  defaultOpen = false
}) => {
  const avatarUrl = user.profileImageUrl ?? getInitialsAvatar(user.firstName ?? "", user.lastName ?? "");
  const slugValue = user.shelfSlug ?? suggestedSlug ?? "";
  const publicShelfUrl = user.shelfSlug ? shelfProfileUrl(user.shelfSlug) : slugValue ? shelfProfileUrl(slugValue) : null;
  return /* @__PURE__ */ jsxs(
    "details",
    {
      class: "group rounded border border-outline bg-surface-alt",
      open: defaultOpen ? true : void 0,
      children: [
        /* @__PURE__ */ jsxs("summary", { class: "flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden", children: [
          /* @__PURE__ */ jsxs("span", { class: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { class: "text-sm font-semibold text-on-surface-strong", children: "Share your shelf" }),
            /* @__PURE__ */ jsx("span", { class: "mt-1 text-sm text-on-surface", children: "Let others browse the photobooks you\u2019ve favorited." })
          ] }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              "stroke-width": "2",
              stroke: "currentColor",
              class: "size-5 shrink-0 text-on-surface transition-transform group-open:rotate-180",
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "m19.5 8.25-7.5 7.5-7.5-7.5"
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            id: "shelf-sharing-container",
            class: "flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5",
            children: [
              /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    id: "shelf-avatar",
                    src: avatarUrl,
                    alt: "",
                    class: "size-14 rounded-full object-cover shrink-0",
                    loading: "lazy"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: user.profileImageUrl ? "Your profile photo appears on your public shelf." : "Add a profile photo so your shelf feels personal." }),
                  /* @__PURE__ */ jsxs(
                    "form",
                    {
                      method: "get",
                      action: `/users/${user.id}/update`,
                      "x-target": "modal-root",
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "hidden",
                            name: "msg",
                            value: user.profileImageUrl ? "Change your profile photo" : "Add a profile photo for your shelf"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Button,
                          {
                            type: "submit",
                            variant: "outline",
                            color: "primary",
                            width: "fit",
                            children: user.profileImageUrl ? "Change photo" : "Add photo"
                          }
                        )
                      ]
                    }
                  )
                ] })
              ] }),
              message ? /* @__PURE__ */ jsx("p", { class: "text-sm text-accent", role: "status", children: message }) : null,
              /* @__PURE__ */ jsxs(
                "form",
                {
                  method: "post",
                  action: "/api/users/me/shelf-sharing",
                  class: "flex flex-col gap-3",
                  ...{
                    "x-target": "shelf-sharing-container",
                    "x-target.error": "shelf-sharing-container"
                  },
                  children: [
                    /* @__PURE__ */ jsxs("label", { class: "flex items-center gap-2 text-sm text-on-surface", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "checkbox",
                          name: "shelfPublic",
                          value: "true",
                          checked: user.shelfPublic ? true : void 0,
                          class: "rounded border-outline"
                        }
                      ),
                      "Make my shelf public"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
                      /* @__PURE__ */ jsx(
                        "label",
                        {
                          for: "shelfSlug",
                          class: "text-sm font-medium text-on-surface-strong",
                          children: "Public URL"
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface shrink-0", children: "/shelf/" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            id: "shelfSlug",
                            name: "shelfSlug",
                            type: "text",
                            value: slugValue,
                            class: "w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface",
                            autocomplete: "off",
                            spellcheck: false
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-3", children: [
                      /* @__PURE__ */ jsx(Button, { type: "submit", variant: "solid", color: "primary", width: "fit", children: "Save sharing settings" }),
                      user.shelfPublic && publicShelfUrl ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
                        "a",
                        {
                          href: publicShelfUrl,
                          class: "text-sm text-accent underline underline-offset-2",
                          children: "View public shelf"
                        }
                      ) }) : null
                    ] })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var ShelfSharingPanel_default = ShelfSharingPanel;
export {
  ShelfSharingPanel_default as default
};
