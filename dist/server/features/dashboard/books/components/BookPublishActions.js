import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { canPublishBook, canPreviewBook, canUnpublishBook } from "../../../../lib/permissions.js";
import FormPatch from "../../../../components/forms/FormPatch.js";
import Button, { button } from "../../../../components/app/Button.js";
import Link from "../../../../components/app/Link.js";
import { eyeIcon, eyeSlashIcon } from "../../../../lib/icons.js";
const BookPublishActions = ({ book, user }) => {
  const bookId = book.id;
  const isPublished = (book.publicationStatus ?? "draft") === "published";
  const intent = isPublished ? "unpublish" : "publish";
  const canToggle = isPublished ? canUnpublishBook(user, book) : canPublishBook(user, book);
  const previewHref = isPublished ? `/books/${book.slug}` : `/books/preview/${book.slug}`;
  const previewLabel = isPublished ? "View live" : "View preview";
  const canOpenPreview = isPublished || canPreviewBook(user, book);
  const previewClass = `${button({
    variant: "outline",
    color: "inverse",
    width: "fit"
  })} inline-flex items-center justify-center`;
  const alpineAttrs = {
    "x-target": `publish-toggle-${bookId} preview-button-${bookId} toast`,
    "x-target.error": "toast",
    "x-target.back": `toast publish-toggle-${bookId}`
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      FormPatch,
      {
        id: `publish-toggle-${bookId}`,
        action: `/dashboard/books/${bookId}`,
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: intent }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "controls", value: "page" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: isPublished ? "outline" : "solid",
              color: isPublished ? "warning" : "success",
              width: "fit",
              isDisabled: !canToggle,
              children: isPublished ? "Unpublish" : "Publish book"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { id: `preview-button-${bookId}`, children: canOpenPreview ? /* @__PURE__ */ jsx(Link, { href: previewHref, target: "_blank", className: previewClass, children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center gap-2", children: [
      isPublished ? eyeIcon(4) : eyeSlashIcon(4),
      previewLabel
    ] }) }) : /* @__PURE__ */ jsx(
      "span",
      {
        class: `${previewClass} opacity-25 cursor-not-allowed`,
        title: "Add a cover image to preview",
        "aria-disabled": "true",
        children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center gap-2", children: [
          eyeSlashIcon(4),
          previewLabel
        ] })
      }
    ) })
  ] });
};
var BookPublishActions_default = BookPublishActions;
export {
  BookPublishActions_default as default
};
