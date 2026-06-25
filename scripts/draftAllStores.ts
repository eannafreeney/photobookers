import "./env";
import { db } from "../src/db/client";
import { bookStores } from "../src/db/schema";

async function draftAllStores() {
  const result = await db
    .update(bookStores)
    .set({ status: "draft" })
    .returning({ id: bookStores.id });

  console.log(`Updated ${result.length} stores to draft.`);
}

draftAllStores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
