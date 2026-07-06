import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { emptyHeartIcon, fullHeartIcon } from "../../../lib/icons.js";
import { canWishlistBook } from "../../../lib/permissions.js";
import { isOk } from "../../../lib/result.js";
import { findWishlist } from "../services.js";
import APIButton from "./APIButton.js";
import APIButtonCircle from "./APIButtonCircle.js";
const FavoriteButton = async ({
  book,
  user,
  isCircleButton = false
}) => {
  let isFavorited = false;
  if (user?.id) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
  }
  const id = `favorite-${book.id}`;
  const isDisabled = !canWishlistBook(user, book);
  const buttonIcon = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { "x-show": isFavorited ? "isSubmitting" : "!isSubmitting", "x-cloak": true, children: emptyHeartIcon() }),
    /* @__PURE__ */ jsx("span", { "x-show": isFavorited ? "!isSubmitting" : "isSubmitting", "x-cloak": true, children: fullHeartIcon() })
  ] });
  const props = {
    id,
    action: `/api/books/${book.id}/wishlist`,
    hiddenInput: { name: "isFavorited", value: isFavorited },
    buttonText: isCircleButton ? buttonIcon : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: isFavorited ? "Favorited" : "Favorite" }),
      /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: isFavorited ? "Favorite" : "Favorited" }),
      buttonIcon
    ] })
  };
  const tooltipText = isFavorited ? "Unfavorite this book" : "Favorite this book";
  if (isCircleButton) {
    return /* @__PURE__ */ jsx(
      APIButtonCircle,
      {
        ...props,
        buttonType: "circle",
        isDisabled,
        tooltipText
      }
    );
  }
  return /* @__PURE__ */ jsx(APIButton, { ...props, isDisabled, isActive: isFavorited });
};
var FavouriteButton_default = FavoriteButton;
export {
  FavouriteButton_default as default
};
