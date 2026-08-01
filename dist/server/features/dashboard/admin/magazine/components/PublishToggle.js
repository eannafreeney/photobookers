import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const PublishMagazineIssueToggle = ({
  issueId,
  isPublished,
  redirect
}) => /* @__PURE__ */ jsxs(
  "form",
  {
    method: "post",
    action: `/dashboard/admin/magazine/${issueId}/publish`,
    "x-data": "{}",
    children: [
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "redirect", value: redirect }),
      /* @__PURE__ */ jsxs(
        "label",
        {
          class: "inline-flex cursor-pointer",
          title: isPublished ? "Unpublish" : "Publish",
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                class: "peer sr-only",
                checked: isPublished,
                "x-on:change": "$root.requestSubmit()"
              }
            ),
            /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-0.25 after:top-0 after:my-auto after:h-5 after:w-5 after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-5 peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-active:outline-offset-0" })
          ]
        }
      )
    ]
  }
);
var PublishToggle_default = PublishMagazineIssueToggle;
export {
  PublishToggle_default as default
};
