import { createRoute } from "hono-fsr";
import { paramValidator, validateImageFile } from "../../../../lib/validator";
import { userIdSchema } from "../../../../schemas";
import { getUser } from "../../../../utils";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { hyperview } from "../../../../lib/hxml";
import { getBaseUrl } from "../../../../lib/hyperview";
import { uploadImage } from "../../../../services/storage";
import { updateUserProfileImageDB } from "../../../../features/dashboard/images/services";
import { getBookComments } from "../../../../features/app/services";
import BookCommentsPanel from "../../../../features/hyperview/components/BookCommentsPanel";
import { getUserFromToken } from "../../../../middleware/getUserFromToken";
import { getAccessTokenFromRequest } from "../../../../lib/getAccessTokenFromRequest";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import { UserIdContext } from "../../../../features/dashboard/admin/users/types";

export const POST = createRoute(paramValidator(userIdSchema), async (c) => {
  const isHyperview = getIsHyperview(c);
  return isHyperview
    ? postProfileImageHyperview(c)
    : postProfileImageWeb(c);
});

const postProfileImageHyperview = async (c: UserIdContext) => {
  const userId = c.req.valid("param").userId;
  const bookId = c.req.query("bookId");
  const user = await getUser(c);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  const renderPanel = async (error?: string | null) => {
    if (!bookId) {
      return hv(
        <view xmlns="https://hyperview.org/hyperview">
          <text style="comment-form-error">Missing book id.</text>
        </view>,
        400,
      );
    }

    const token = getAccessTokenFromRequest(c);
    const freshUser = token ? await getUserFromToken(token) : user;
    const [commentsErr, comments] = await getBookComments(bookId);

    if (commentsErr || !comments) {
      return hv(
        <view xmlns="https://hyperview.org/hyperview">
          <text style="comments-placeholder">Could not load comments.</text>
        </view>,
      );
    }

    return hv(
      <BookCommentsPanel
        bookId={bookId}
        baseUrl={baseUrl}
        user={freshUser}
        comments={comments}
        error={error}
      />,
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

  let profileImageUrl: string | null = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `users/profile-images/${userId}`,
      "cover",
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

const postProfileImageWeb = async (c: UserIdContext) => {
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

  let profileImageUrl: string | null = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `users/profile-images/${userId}`,
      "cover",
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
