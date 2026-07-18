import { createRoute } from "hono-fsr";
import { paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import { updateIssueDetails } from "@/domain/magazine/mutations";
import { regenerateTitle } from "@/features/dashboard/admin/magazine/generate";

// Generate a fresh title for the issue while keeping its theme. Called by the
// details form's "Regenerate" button via fetch, so it returns JSON the client
// drops straight into the title field rather than a rendered fragment.
export const POST = createRoute(paramValidator(idSchema), async (c) => {
  const id = c.req.valid("param").id;

  const [loadErr, issue] = await getIssueByIdForAdmin(id);
  if (loadErr || !issue) {
    return c.json({ error: loadErr?.reason ?? "Issue not found" }, 404);
  }

  const [genErr, result] = await regenerateTitle(issue);
  if (genErr) return c.json({ error: genErr.reason }, 502);

  const [saveErr] = await updateIssueDetails(id, { title: result.title });
  if (saveErr) return c.json({ error: saveErr.reason }, 500);

  return c.json({ title: result.title });
});
