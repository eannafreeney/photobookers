import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../components/forms/FormButtons.js";
import FormPost from "../../../components/forms/FormPost.js";
import Modal from "../../../components/app/Modal.js";
import TextArea from "../../../components/forms/TextArea.js";
import { LIST_ITEM_NOTE_MAX_LENGTH } from "../../../domain/lists/utils.js";
const previewComment = (body, max = 140) => {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}\u2026`;
};
const ListBookNoteModal = ({
  list,
  book,
  note,
  comments = []
}) => {
  const formValues = { note: note ?? "" };
  const commentBodies = comments.map((c) => c.body.trim()).filter((body) => body.length > 0);
  const alpineAttrs = {
    "x-data": `listBookNoteForm(${JSON.stringify(formValues)}, ${JSON.stringify(commentBodies)})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast list-books-editor",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess(); $dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsxs(Modal, { title: "Add a note", children: [
    /* @__PURE__ */ jsxs("div", { class: "mb-4 flex items-center gap-3", children: [
      book.coverUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: book.coverUrl,
          alt: "",
          class: "size-16 shrink-0 object-cover"
        }
      ) : /* @__PURE__ */ jsx("div", { class: "size-16 shrink-0 bg-surface-alt" }),
      /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong", children: book.title }),
        book.artist?.displayName ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: book.artist.displayName }) : null,
        book.publisher?.displayName ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: book.publisher.displayName }) : null,
        /* @__PURE__ */ jsxs("p", { class: "mt-1 text-xs text-on-surface-weak", children: [
          "In ",
          list.title
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/lists/${list.id}/books/${book.id}/note`,
        class: "flex flex-col gap-4",
        ...alpineAttrs,
        children: [
          commentBodies.length > 0 ? /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 rounded border border-outline bg-surface-alt p-3", children: [
            /* @__PURE__ */ jsx("p", { class: "text-xs font-medium text-on-surface-weak", children: commentBodies.length === 1 ? "You\u2019ve commented on this book" : "You\u2019ve commented on this book \u2014 pick one to use as the note" }),
            /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-2", children: commentBodies.map((body, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                class: "w-full rounded border border-outline bg-surface px-3 py-2 text-left text-sm text-on-surface hover:border-outline-strong cursor-pointer",
                "x-on:click": `useCommentAt(${index})`,
                children: [
                  /* @__PURE__ */ jsx("span", { class: "line-clamp-3 whitespace-pre-wrap", children: previewComment(body) }),
                  /* @__PURE__ */ jsx("span", { class: "mt-1 block text-xs text-accent", children: commentBodies.length === 1 ? "Use as note" : "Use this comment" })
                ]
              }
            ) })) })
          ] }) : null,
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "Note",
              name: "form.note",
              minRows: 5,
              maxLength: LIST_ITEM_NOTE_MAX_LENGTH,
              validateInput: "validateField('note')",
              placeholder: "Why this book is on the list\u2026"
            }
          ),
          /* @__PURE__ */ jsx(
            FormButtons,
            {
              buttonText: "Save note",
              loadingText: "Saving\u2026",
              showCancelButton: true
            }
          )
        ]
      }
    )
  ] });
};
var ListBookNoteModal_default = ListBookNoteModal;
export {
  ListBookNoteModal_default as default
};
