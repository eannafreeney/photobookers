import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { canLikeBook } from "../../../lib/permissions.js";
import { isOk } from "../../../lib/result.js";
import { findLike } from "../services.js";
import APIButton from "./APIButton.js";
import APIButtonCircle from "./APIButtonCircle.js";
const LikeButton = async ({
  book,
  user,
  isCircleButton = false
}) => {
  let isLiked = false;
  if (user?.id) {
    const likeResult = await findLike(user.id, book.id);
    isLiked = isOk(likeResult);
  }
  const id = `like-${book.id}`;
  const isDisabled = !canLikeBook(user, book);
  const buttonIcon = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { "x-show": isLiked ? "isSubmitting" : "!isSubmitting", "x-cloak": true, children: likeIcon() }),
    /* @__PURE__ */ jsx("span", { "x-show": isLiked ? "!isSubmitting" : "isSubmitting", "x-cloak": true, children: likedIcon() })
  ] });
  const props = {
    id,
    action: `/api/books/${book.id}/like`,
    hiddenInput: { name: "isLiked", value: isLiked },
    buttonText: isCircleButton ? buttonIcon : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: isLiked ? "Liked" : "Like" }),
      /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", "x-cloak": true, children: isLiked ? "Like" : "Liked" }),
      buttonIcon
    ] })
  };
  const tooltipText = isLiked ? "Remove from my Likes" : "Add to my Likes";
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
  return /* @__PURE__ */ jsx(APIButton, { ...props, isDisabled });
};
var LikeButton_default = LikeButton;
const likeIcon = (size = 4) => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: `size-${size}`,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
      }
    )
  }
);
const likedIcon = (size = 4) => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: `size-${size} text-success`,
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
      }
    )
  }
);
export {
  LikeButton_default as default
};
