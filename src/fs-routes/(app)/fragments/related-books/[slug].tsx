import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { slugSchema } from "../../../../features/app/schema";
import { getBookBySlug } from "../../../../features/app/services";
import { getUser } from "../../../../utils";
import RelatedBooks from "../../../../features/app/components/RelatedBooks";
import { BookDetailContext } from "../../../../features/app/types";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: BookDetailContext) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const [error, result] = await getBookBySlug(bookSlug);

    if (error || !result) return c.html(<></>);
    const { book } = result;

    return c.html(
      <div id="related-books-fragment">
        <RelatedBooks book={book} user={user} />
      </div>,
    );
  },
);
