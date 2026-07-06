import { jsx } from "hono/jsx/jsx-runtime";
import { eyeIcon, eyeSlashIcon } from "../../../lib/icons.js";
import { canPreviewBook } from "../../../lib/permissions.js";
import Link from "../../../components/app/Link.js";
const PreviewButton = ({ book, user }) => {
  const bookId = book.id;
  if (book.publicationStatus === "published") {
    return /* @__PURE__ */ jsx("div", { id: `preview-button-${bookId}`, children: /* @__PURE__ */ jsx(Link, { href: `/books/${book.slug}`, target: "_blank", children: eyeIcon() }) });
  }
  return /* @__PURE__ */ jsx("div", { id: `preview-button-${bookId}`, children: /* @__PURE__ */ jsx(Link, { href: `/books/preview/${book.slug}`, target: "_blank", children: /* @__PURE__ */ jsx("button", { class: "cursor-pointer", disabled: !canPreviewBook(user, book), children: eyeSlashIcon() }) }) });
};
var PreviewButton_default = PreviewButton;
export {
  PreviewButton_default as default
};
