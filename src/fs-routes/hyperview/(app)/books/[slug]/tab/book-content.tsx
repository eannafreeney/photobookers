import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Image, Text } from "../../../../../../lib/hxml-comps";
import { getBookBySlug } from "../../../../../../features/app/services";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const hv = hyperview(c);
  const [error, result] = await getBookBySlug(slug);

  if (error || !result?.book) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Book not found.</Text>
      </view>,
      404,
    );
  }

  const { book } = result;

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {book.coverUrl && (
        <Image source={book.coverUrl} style="cover" resize-mode="cover" />
      )}
      <Text style="title">{book.title}</Text>
      <Text style="subtitle">{book.artist?.displayName}</Text>
      <Text style="description">{book.description}</Text>
    </view>,
  );
});
