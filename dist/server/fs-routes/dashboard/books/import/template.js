import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { buildImportTemplateCsv } from "../../../../features/dashboard/books/import/buildTemplate.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user.creator) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }));
  }
  const csv = buildImportTemplateCsv(user.creator.type);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="photobookers-import-template.csv"'
    }
  });
});
export {
  GET
};
