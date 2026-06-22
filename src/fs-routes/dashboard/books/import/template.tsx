import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../../../utils";
import InfoPage from "../../../../pages/InfoPage";
import { buildImportTemplateCsv } from "../../../../features/dashboard/books/import/buildTemplate";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
  }

  const csv = buildImportTemplateCsv(user.creator.type);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="photobookers-import-template.csv"',
    },
  });
});
