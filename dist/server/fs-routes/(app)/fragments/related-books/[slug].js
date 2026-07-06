import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator.js";
import { slugSchema } from "../../../../features/app/schema.js";
import { getBookBySlug } from "../../../../features/app/services.js";
import { getUser } from "../../../../utils.js";
import RelatedBooks from "../../../../features/app/components/RelatedBooks.js";
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const [error, result] = await getBookBySlug(bookSlug);
    if (error || !result) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
    const { book } = result;
    return c.html(
      /* @__PURE__ */ jsx("div", { id: "related-books-fragment", children: /* @__PURE__ */ jsx(RelatedBooks, { book, user }) })
    );
  }
);
export {
  GET
};
