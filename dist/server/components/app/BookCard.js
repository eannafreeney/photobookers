import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import Card from "./Card.js";
import { formatDate } from "../../utils.js";
import CardCreatorCard from "./CardCreatorCard.js";
import Link from "./Link.js";
import Show from "./Show.js";
import WishlistButton from "../../features/api/components/FavouriteButton.js";
const BookCard = ({
  book,
  user,
  currentCreatorId,
  maxDisplayNameLength = 16,
  className,
  featureDate
}) => {
  const displayDate = featureDate ?? book.releaseDate;
  return /* @__PURE__ */ jsxs(Card, { className: clsx(className ?? "min-w-[200px] max-w-[24rem]"), children: [
    /* @__PURE__ */ jsx(Show, { when: currentCreatorId !== book.artist?.id, children: /* @__PURE__ */ jsxs("div", { class: "px-3 py-2 flex items-center justify-between gap-2 h-10", children: [
      /* @__PURE__ */ jsx("div", { class: "min-w-0 flex-1", children: /* @__PURE__ */ jsx(
        CardCreatorCard,
        {
          creator: book.artist ?? null,
          maxDisplayNameLength: book.releaseDate ? maxDisplayNameLength : 30
        }
      ) }),
      displayDate ? /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak whitespace-nowrap text-[10px]", children: formatDate(displayDate) }) : null
    ] }) }),
    /* @__PURE__ */ jsx(
      Card.Image,
      {
        src: book.coverUrl ?? "",
        alt: book.title,
        href: `/books/${book.slug}`
      }
    ),
    /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-0 mr-4", children: [
        /* @__PURE__ */ jsx(Link, { href: `/books/${book.slug}`, children: /* @__PURE__ */ jsx(Card.Title, { children: book.title }) }),
        /* @__PURE__ */ jsx(
          Show,
          {
            when: !!book.publisher && currentCreatorId !== book.publisher?.id,
            children: /* @__PURE__ */ jsx("p", { class: "kicker text-on-surface-weak mt-1", children: book.publisher?.displayName ?? "" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(WishlistButton, { isCircleButton: true, book, user })
    ] }) })
  ] });
};
var BookCard_default = BookCard;
export {
  BookCard_default as default
};
