import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator, validateImageFile } from "../../../../lib/validator.js";
import { userIdSchema } from "../../../../schemas/index.js";
import { getUser } from "../../../../utils.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import { hyperview } from "../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { uploadImage } from "../../../../services/storage.js";
import { updateUserProfileImageDB } from "../../../../features/dashboard/images/services.js";
import { getBookComments } from "../../../../features/app/services.js";
import BookCommentsPanel from "../../../../features/hyperview/components/BookCommentsPanel.js";
import { getUserFromToken } from "../../../../middleware/getUserFromToken.js";
import { getAccessTokenFromRequest } from "../../../../lib/getAccessTokenFromRequest.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
const POST = createRoute(paramValidator(userIdSchema), async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview ? postProfileImageHyperview(c) : postProfileImageWeb(c);
});
const postProfileImageHyperview = async (c) => {
  const userId = c.req.valid("param").userId;
  const bookId = c.req.query("bookId");
  const user = await getUser(c);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const renderPanel = async (error) => {
    if (!bookId) {
      return hv(
        /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx("text", { style: "comment-form-error", children: "Missing book id." }) }),
        400
      );
    }
    const token = getAccessTokenFromRequest(c);
    const freshUser = token ? await getUserFromToken(token) : user;
    const [commentsErr, comments] = await getBookComments(bookId);
    if (commentsErr || !comments) {
      return hv(
        /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx("text", { style: "comments-placeholder", children: "Could not load comments." }) })
      );
    }
    return hv(
      /* @__PURE__ */ jsx(
        BookCommentsPanel,
        {
          bookId,
          baseUrl,
          user: freshUser,
          comments,
          error
        }
      )
    );
  };
  if (!user?.id || user.id !== userId) {
    return renderPanel("Sign in to update your profile photo.");
  }
  const body = await c.req.parseBody();
  const validatedFile = validateImageFile(body.userImageProfile);
  if (!validatedFile.success) {
    return renderPanel(validatedFile.error);
  }
  let profileImageUrl = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `users/profile-images/${userId}`,
      "cover"
    );
    profileImageUrl = result.url;
  } catch (error) {
    console.error("Failed to upload profile image", error);
    return renderPanel("Failed to upload profile image.");
  }
  const [err] = await updateUserProfileImageDB(userId, profileImageUrl);
  if (err) return renderPanel(err.reason);
  return renderPanel();
};
const postProfileImageWeb = async (c) => {
  const userId = c.req.valid("param").userId;
  const user = await getUser(c);
  if (!user?.id || user.id !== userId) {
    return showErrorAlert(c, "You can only update your own profile photo.");
  }
  const body = await c.req.parseBody();
  const validatedFile = validateImageFile(body.userImageProfile);
  if (!validatedFile.success) {
    return showErrorAlert(c, validatedFile.error);
  }
  let profileImageUrl = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `users/profile-images/${userId}`,
      "cover"
    );
    profileImageUrl = result.url;
  } catch (error) {
    console.error("Failed to upload profile image", error);
    return showErrorAlert(c, "Failed to upload profile image");
  }
  const [err] = await updateUserProfileImageDB(userId, profileImageUrl);
  if (err) return showErrorAlert(c, err.reason);
  return showSuccessAlert(c, "Profile photo updated.");
};
export {
  POST
};
