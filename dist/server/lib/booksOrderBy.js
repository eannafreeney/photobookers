import { sql } from "drizzle-orm";
function getBooksOrderBy(sortBy) {
  return (fields, { asc: a, desc: d }) => {
    switch (sortBy) {
      case "newest":
        return [
          sql`${fields.releaseDate} DESC NULLS LAST`,
          d(fields.createdAt)
        ];
      case "oldest":
        return [sql`${fields.releaseDate} ASC NULLS FIRST`];
      case "title_asc":
        return [a(fields.title)];
      case "title_desc":
        return [d(fields.title)];
      case "creator_order":
        return [
          sql`${fields.sortOrder} ASC NULLS LAST`,
          d(fields.createdAt)
        ];
      default:
        return [a(fields.title)];
    }
  };
}
export {
  getBooksOrderBy
};
