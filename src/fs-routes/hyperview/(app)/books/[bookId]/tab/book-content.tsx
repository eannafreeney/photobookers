import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { paramValidator } from "../../../../../../lib/validator";
import BookPage from "../../../../../../features/hyperview/components/BookPage";
import { getBookById } from "../../../../../../features/dashboard/books/services";
import { bookIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);

  const [error, book] = await getBookById(bookId);

  if (error || !book) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Book not found.</Text>
      </view>,
      404,
    );
  }

  const galleryImages = [
    book.coverUrl,
    ...(book.images?.map((image) => image.imageUrl) ?? []),
  ];

  return hv(<BookPage galleryImages={galleryImages} book={book} />);
});
