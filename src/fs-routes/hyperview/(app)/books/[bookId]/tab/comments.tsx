import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import {
  getBookBySlug,
  getBookComments,
  getDisplayName,
} from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Image, Text, View } from "../../../../../../lib/hxml-comps";
import { formatDate } from "../../../../../../utils";
import { bookIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);

  const [commentsErr, comments] = await getBookComments(bookId);

  if (commentsErr || !comments) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Could not load comments.</Text>
      </view>,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <Text style="comments-heading">What did you love about this book?</Text>
      {comments.length === 0 ? (
        <Text style="comments-empty">
          No comments yet. Be the first to comment!
        </Text>
      ) : (
        <>
          {comments.map((comment) => {
            const creator = comment.user?.creators?.[0] ?? null;
            const authorName = creator
              ? creator.displayName
              : getDisplayName(comment.user);
            const authorImage =
              creator?.coverUrl ?? comment.user?.profileImageUrl;

            return (
              <View key={comment.id} style="comment-item">
                <View style="comment-author-row">
                  {authorImage ? (
                    <Image
                      source={authorImage}
                      style="comment-avatar"
                      resize-mode="cover"
                    />
                  ) : (
                    <View style="comment-avatar-placeholder" />
                  )}
                  <View style="comment-author-info">
                    <Text style="comment-username">{authorName}</Text>
                    {comment.createdAt && (
                      <Text style="comment-date">
                        {formatDate(comment.createdAt)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style="comment-body">{comment.body}</Text>
              </View>
            );
          })}
        </>
      )}
    </view>,
  );
});
