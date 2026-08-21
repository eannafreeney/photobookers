import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import PreviewButton from "../../../api/components/PreviewButton.js";
import Button from "../../../../components/app/Button.js";
import PublishToggleForm from "./PublishToggleForm.js";
import TableSearch from "../../../../components/app/TableSearch.js";
import Link from "../../../../components/app/Link.js";
import BookApprovalStatusPill from "../../admin/books/components/BookApprovalStatusPill.js";
import EditRowButton from "../../../app/components/EditRowButton.js";
import DeleteRowButton from "../../../app/components/DeleteRowButton.js";
import { InfiniteScroll } from "../../../../components/app/InfiniteScroll.js";
const BooksOverviewMobile = ({
  books,
  user,
  currentPath,
  page,
  totalPages,
  basePath = "/dashboard",
  editBasePath = "/dashboard/books"
}) => {
  const targetId = "books-table-body";
  const listAttrs = {
    "x-init": "true",
    "@books:updated.window": `$ajax('${basePath}', { target: '${targetId}' })`
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-3", children: /* @__PURE__ */ jsx(
      TableSearch,
      {
        isMobile: true,
        target: "books-table",
        action: basePath,
        placeholder: "Filter books..."
      }
    ) }),
    /* @__PURE__ */ jsx("ul", { id: targetId, class: "flex flex-col gap-4", ...listAttrs, children: books.map((book) => /* @__PURE__ */ jsx(BookCardMobile, { book, user, editBasePath })) }),
    totalPages > 1 ? /* @__PURE__ */ jsx(
      InfiniteScroll,
      {
        baseUrl: currentPath,
        page,
        totalPages,
        targetId
      }
    ) : null
  ] });
};
var BooksOverviewMobile_default = BooksOverviewMobile;
const BookCardMobile = ({ book, user, editBasePath }) => {
  if (!book?.id || !book.slug || !book.title) {
    return null;
  }
  return /* @__PURE__ */ jsx("li", { class: "rounded-radius border border-outline bg-surface overflow-hidden", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 p-4", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex gap-3", children: [
      /* @__PURE__ */ jsx("div", { class: "shrink-0", children: book.coverUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: book.coverUrl,
          alt: book.title,
          class: "h-20 w-14 object-cover rounded-sm"
        }
      ) : /* @__PURE__ */ jsx("a", { href: `${editBasePath}/${book.id}#book-images`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "warning", children: /* @__PURE__ */ jsx("span", { children: "Upload Cover" }) }) }) }),
      /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: book.publicationStatus === "published" ? `/books/${book.slug}` : `/books/preview/${book.slug}`,
            children: /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong line-clamp-3", children: book.title })
          }
        ),
        book.artist ? /* @__PURE__ */ jsx(
          Link,
          {
            href: `/creators/${book.artist.slug}`,
            className: "block text-sm text-on-surface-weak line-clamp-1",
            hoverUnderline: true,
            children: book.artist.displayName
          }
        ) : null,
        book.publisher ? /* @__PURE__ */ jsx(
          Link,
          {
            href: `/creators/${book.publisher.slug}`,
            className: "block text-sm text-on-surface-weak line-clamp-1",
            hoverUnderline: true,
            children: book.publisher.displayName
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs("dl", { class: "grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm", children: [
      /* @__PURE__ */ jsx("dt", { class: "text-on-surface-weak", children: "Approval" }),
      /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx(
        BookApprovalStatusPill,
        {
          approvalStatus: book.approvalStatus ?? "pending"
        }
      ) }),
      /* @__PURE__ */ jsx("dt", { class: "text-on-surface-weak", children: "Publish" }),
      /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx(PublishToggleForm, { book, user }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3", children: [
      /* @__PURE__ */ jsx(PreviewButton, { book, user }),
      /* @__PURE__ */ jsx(EditRowButton, { href: `${editBasePath}/${book.id}` }),
      /* @__PURE__ */ jsx(
        DeleteRowButton,
        {
          action: `${editBasePath}/${book.id}`,
          confirm: "Are you sure?",
          ...{ "@ajax.success": "$dispatch('books:updated')" }
        }
      )
    ] })
  ] }) });
};
export {
  BooksOverviewMobile_default as default
};
