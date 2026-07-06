import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { canPublishBook } from "../../../../lib/permissions.js";
import FormPatch from "../../../../components/forms/FormPatch.js";
const PublishToggleForm = ({ book, user }) => {
  const bookId = book.id;
  const publicationStatus = book.publicationStatus ?? "draft";
  const isPublished = publicationStatus === "published";
  const intent = isPublished ? "unpublish" : "publish";
  const alpineAttrs = {
    "x-data": `{ isPublished: ${isPublished} }`,
    "x-target": `publish-toggle-${bookId} preview-button-${bookId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`,
    "x-target.back": `toast publish-toggle-${bookId}`
  };
  const action = `/dashboard/books/${bookId}`;
  return /* @__PURE__ */ jsxs(FormPatch, { id: `publish-toggle-${bookId}`, action, ...alpineAttrs, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: intent }),
    /* @__PURE__ */ jsxs("label", { class: "cursor-pointer", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          class: "peer sr-only",
          checked: isPublished,
          name: "isPublished",
          "x-on:change": "$root.requestSubmit()",
          title: "Publish",
          disabled: !canPublishBook(user, book)
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" })
    ] })
  ] });
};
var PublishToggleForm_default = PublishToggleForm;
export {
  PublishToggleForm_default as default
};
