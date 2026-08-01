import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import AiActionForm from "./AiActionForm.js";
import ArtistAnswerForm from "./ArtistAnswerForm.js";
import ArtistEmailAction from "./ArtistEmailAction.js";
import DeleteBookForm from "./DeleteBookForm.js";
import DescriptionForm from "./DescriptionForm.js";
import ReorderControls from "./ReorderControls.js";
const IssueBookCard = ({
  number,
  count = number,
  bookId,
  book,
  blurb,
  action,
  selectedImageUrl = null,
  artistPrompt = null,
  artistQuote = null,
  artistEmailSentAt = null
}) => {
  const targetId = `magazine-book-${number}`;
  const thumbnailUrl = selectedImageUrl ?? book?.coverUrl ?? null;
  return /* @__PURE__ */ jsxs(
    "li",
    {
      id: targetId,
      class: "flex flex-col md:flex-row items-start gap-3 border border-outline bg-surface-alt/40 p-3",
      children: [
        /* @__PURE__ */ jsxs("div", { class: "w-full md:w-[30%] shrink-0", children: [
          thumbnailUrl ? /* @__PURE__ */ jsx(
            "img",
            {
              src: thumbnailUrl,
              alt: "",
              loading: "lazy",
              class: "w-full border border-outline object-cover"
            }
          ) : /* @__PURE__ */ jsx("div", { class: "flex aspect-3/4 w-full items-center justify-center border border-outline text-[0.6rem] text-on-surface-weak", children: "no image" }),
          /* @__PURE__ */ jsxs("div", { class: "mt-2 flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx("a", { href: `${action}/image?bookId=${bookId}`, "x-target": "modal-root", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: selectedImageUrl ? "Change image" : "Choose image" }) }),
            /* @__PURE__ */ jsx(
              AiActionForm,
              {
                action: `${action}/regenerate-blurb`,
                bookId,
                targetId,
                label: "Regenerate blurb (AI)",
                busyLabel: "Writing\u2026"
              }
            ),
            /* @__PURE__ */ jsx(
              AiActionForm,
              {
                action: `${action}/swap-book`,
                bookId,
                targetId,
                label: "Swap book (AI)",
                busyLabel: "Swapping\u2026"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 w-full md:w-auto flex-1 flex-col gap-2", children: [
          /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsx("div", { class: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { class: "font-display text-2xl font-medium text-on-surface-strong", children: /* @__PURE__ */ jsx("a", { href: `/books/${book?.slug}`, target: "_blank", children: book?.title ?? "Untitled" }) }) }),
            /* @__PURE__ */ jsxs("div", { class: "flex shrink-0 items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                ReorderControls,
                {
                  bookId,
                  action,
                  isFirst: number <= 1,
                  isLast: number >= count
                }
              ),
              /* @__PURE__ */ jsx(DeleteBookForm, { bookId, action })
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface-weak", children: /* @__PURE__ */ jsx("a", { href: `/creators/${book?.artist?.slug}`, target: "_blank", children: book?.artist?.displayName ?? "Unknown artist" }) }),
          /* @__PURE__ */ jsx("span", { class: "text-sm text-on-surface-weak", children: /* @__PURE__ */ jsx("a", { href: `/creators/${book?.publisher?.slug}`, target: "_blank", children: book?.publisher?.displayName ?? "Unknown publisher" }) }),
          /* @__PURE__ */ jsx(DescriptionForm, { bookId, blurb, action }),
          artistPrompt ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-strong", children: `Question: ${artistPrompt}` }) : null,
          /* @__PURE__ */ jsx(
            ArtistEmailAction,
            {
              action,
              bookId,
              artistEmailSentAt
            }
          ),
          artistEmailSentAt ? /* @__PURE__ */ jsx(
            ArtistAnswerForm,
            {
              bookId,
              artistQuote,
              action
            }
          ) : null
        ] })
      ]
    }
  );
};
var IssueBookCard_default = IssueBookCard;
export {
  IssueBookCard_default as default
};
