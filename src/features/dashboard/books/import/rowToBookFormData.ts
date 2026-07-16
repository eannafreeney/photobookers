import type { z } from "zod";
import type { bookFormSchema } from "../schema";
import type { ValidatedCsvBookRow } from "./schema";

export function rowToBookFormData(
  row: ValidatedCsvBookRow,
  creatorType: "artist" | "publisher",
): z.infer<typeof bookFormSchema> {
  const base = {
    title: row.title,
    description: row.description || undefined,
    release_date: row.release_date || undefined,
    // Manual form requires tags; bulk import keeps them optional (empty → no tags).
    tags: row.tags || "",
    purchase_link: row.purchase_link || undefined,
    availability_status: row.availability_status,
    send_email_to_followers_on_release: false,
  };

  if (creatorType === "publisher") {
    return {
      ...base,
      intent: "publisher",
      new_artist_name: row.artist,
    };
  }

  return {
    ...base,
    intent: "artist",
    new_publisher_name: row.publisher || undefined,
  };
}
