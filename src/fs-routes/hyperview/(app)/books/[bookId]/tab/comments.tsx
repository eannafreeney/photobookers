import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { getBookComments } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { bookIdSchema } from "../../../../../../schemas";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import BookCommentsPanel from "../../../../../../features/hyperview/components/BookCommentsPanel";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

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
      <BookCommentsPanel
        bookId={bookId}
        baseUrl={baseUrl}
        user={user}
        comments={comments}
      />
    </view>,
  );
});
