import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../components/forms/FormButtons.js";
const ListForm = ({ list }) => {
  const isEdit = Boolean(list);
  const action = isEdit ? `/dashboard/lists/${list.id}` : "/dashboard/lists";
  const alpineAttrs = isEdit ? {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": "toast list-form-panel",
    "x-target.error": "toast"
  } : {
    "x-data": "{ isSubmitting: false }",
    "@submit": "isSubmitting = true"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id: isEdit ? "list-form-panel" : "list-create-form",
      method: "post",
      action,
      class: "flex flex-col gap-4 max-w-xl",
      ...alpineAttrs,
      children: [
        isEdit ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "PATCH" }) : null,
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("label", { class: "kicker text-on-surface-weak", for: "list-title", children: "Title" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "list-title",
              name: "title",
              required: true,
              maxlength: 255,
              value: list?.title ?? "",
              placeholder: "Favourite books of the year",
              class: "rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("label", { class: "kicker text-on-surface-weak", for: "list-description", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "list-description",
              name: "description",
              maxlength: 2e3,
              rows: 4,
              placeholder: "Optional notes about this list",
              class: "rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong",
              children: list?.description ?? ""
            }
          )
        ] }),
        isEdit ? /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("label", { class: "kicker text-on-surface-weak", for: "list-slug", children: "URL slug" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "list-slug",
              name: "slug",
              required: true,
              maxlength: 255,
              value: list?.slug ?? "",
              class: "rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface-strong"
            }
          ),
          /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-weak", children: "Used in your public list URL when the list is public." })
        ] }) : null,
        /* @__PURE__ */ jsxs("label", { class: "flex items-center gap-2 text-sm text-on-surface", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              name: "isPublic",
              value: "true",
              checked: list?.isPublic ?? false,
              class: "size-4"
            }
          ),
          "Make this list public on my shelf"
        ] }),
        /* @__PURE__ */ jsx(
          FormButtons,
          {
            buttonText: isEdit ? "Save changes" : "Create list",
            loadingText: isEdit ? "Saving\u2026" : "Creating\u2026"
          }
        )
      ]
    }
  );
};
var ListForm_default = ListForm;
export {
  ListForm_default as default
};
