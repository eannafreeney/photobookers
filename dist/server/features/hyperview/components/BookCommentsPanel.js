import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getDisplayName } from "../../app/services.js";
import {
  Behavior,
  Form,
  Image,
  Style,
  Text,
  TextField,
  View
} from "../../../lib/hxml-comps.js";
import { formatDate } from "../../../utils.js";
import SignInPrompt from "./SignInPrompt.js";
const BOOK_COMMENTS_PANEL_ID = "book-comments-panel";
const ProfilePhotoForm = ({
  userId,
  bookId,
  baseUrl
}) => /* @__PURE__ */ jsxs(View, { style: "profile-photo-form", children: [
  /* @__PURE__ */ jsx(Text, { style: "comment-form-hint", children: "Add a profile photo from your library to comment." }),
  /* @__PURE__ */ jsxs(View, { style: "comment-form-submit", children: [
    /* @__PURE__ */ jsx(Text, { style: "comment-form-submit-label", children: "Choose Photo" }),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        action: "pick-profile-photo",
        href: `${baseUrl}/api/users/${userId}/profile-image?bookId=${encodeURIComponent(bookId)}`,
        target: BOOK_COMMENTS_PANEL_ID
      }
    )
  ] })
] });
const BookCommentForm = ({ bookId, baseUrl }) => /* @__PURE__ */ jsxs(Form, { id: `comment-form-${bookId}`, children: [
  /* @__PURE__ */ jsx(
    TextField,
    {
      style: "comment-form-input",
      name: "body",
      placeholder: "Share what you loved about this book\u2026"
    }
  ),
  /* @__PURE__ */ jsxs(View, { style: "comment-form-submit", children: [
    /* @__PURE__ */ jsx(Text, { style: "comment-form-submit-label", children: "Add Comment" }),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        verb: "post",
        action: "replace",
        target: BOOK_COMMENTS_PANEL_ID,
        href: `${baseUrl}/api/books/${bookId}/comments`
      }
    )
  ] })
] });
const BookCommentsPanel = ({
  bookId,
  baseUrl,
  user,
  comments,
  error
}) => {
  const hasUserCommented = !!user?.id && comments.some((comment) => comment.userId === user.id);
  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);
  return /* @__PURE__ */ jsxs(View, { id: BOOK_COMMENTS_PANEL_ID, xmlns: "https://hyperview.org/hyperview", children: [
    /* @__PURE__ */ jsx(Text, { style: "comments-heading", children: "What did you love about this book?" }),
    error ? /* @__PURE__ */ jsx(Text, { style: "comment-form-error", children: error }) : null,
    !user ? /* @__PURE__ */ jsx(
      SignInPrompt,
      {
        variant: "fragment",
        baseUrl,
        hint: "Log into comment on this book."
      }
    ) : !hasProfilePic && user.id ? /* @__PURE__ */ jsx(ProfilePhotoForm, { userId: user.id, bookId, baseUrl }) : !hasUserCommented ? /* @__PURE__ */ jsx(BookCommentForm, { bookId, baseUrl }) : null,
    comments.length === 0 ? /* @__PURE__ */ jsx(Text, { style: "comments-empty", children: "No comments yet. Be the first to comment!" }) : /* @__PURE__ */ jsx(Fragment, { children: comments.map((comment) => {
      const creator = comment.user?.creators?.[0] ?? null;
      const authorName = creator ? creator.displayName : getDisplayName(comment.user);
      const authorImage = creator?.coverUrl ?? comment.user?.profileImageUrl;
      return /* @__PURE__ */ jsxs(View, { style: "comment-item", children: [
        /* @__PURE__ */ jsxs(View, { style: "comment-author-row", children: [
          authorImage ? /* @__PURE__ */ jsx(
            Image,
            {
              source: authorImage,
              style: "comment-avatar",
              "resize-mode": "cover"
            }
          ) : /* @__PURE__ */ jsx(View, { style: "comment-avatar-placeholder" }),
          /* @__PURE__ */ jsxs(View, { style: "comment-author-info", children: [
            /* @__PURE__ */ jsx(Text, { style: "comment-username", children: authorName }),
            comment.createdAt && /* @__PURE__ */ jsx(Text, { style: "comment-date", children: formatDate(comment.createdAt) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Text, { style: "comment-body", children: comment.body })
      ] }, comment.id);
    }) })
  ] });
};
var BookCommentsPanel_default = BookCommentsPanel;
const bookCommentsPanelStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-form-input",
      borderWidth: 1,
      borderColor: "#e4e0d5",
      borderRadius: 0,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 12,
      paddingRight: 12,
      fontSize: 15,
      backgroundColor: "#fbfaf7",
      color: "#191613",
      minHeight: 96,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-form-submit",
      backgroundColor: "#191613",
      borderRadius: 0,
      paddingTop: 12,
      paddingBottom: 12,
      alignItems: "center",
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-form-submit-label",
      color: "#fbfaf7",
      fontWeight: "600",
      fontSize: 15
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-form-hint",
      fontSize: 14,
      color: "#45413a",
      marginBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-form-error",
      fontSize: 14,
      color: "#b91c1c",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "comment-form-signin", marginBottom: 16 }),
  /* @__PURE__ */ jsx(Style, { id: "profile-photo-form", marginBottom: 16 })
] });
export {
  BOOK_COMMENTS_PANEL_ID,
  bookCommentsPanelStyles,
  BookCommentsPanel_default as default
};
