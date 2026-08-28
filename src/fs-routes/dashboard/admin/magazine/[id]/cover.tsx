import { createRoute } from "hono-fsr";
import { paramValidator, validateImageFile } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { updateIssueCoverUrl } from "@/domain/magazine/mutations";
import { showErrorAlert, showSuccessAlert } from "@/lib/alertHelpers";
import { uploadImage } from "@/services/storage";
import { getUser } from "@/utils";

export const POST = createRoute(paramValidator(idSchema), async (c) => {
  const user = await getUser(c);
  if (!user?.isAdmin) {
    return showErrorAlert(c, "You are not authorized to do this.", 403);
  }

  const id = c.req.valid("param").id;
  const body = await c.req.parseBody();

  const validatedFile = validateImageFile(body.cover);
  if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

  let coverUrl: string | null = null;
  try {
    const result = await uploadImage(
      validatedFile.file,
      `magazine/covers/${id}`,
      "cover",
    );
    coverUrl = result.url;
  } catch (error) {
    console.error("error uploading magazine cover", error);
    return showErrorAlert(c, "Failed to upload cover image");
  }

  const [err, updated] = await updateIssueCoverUrl(id, coverUrl);
  if (err) return showErrorAlert(c, err.reason);
  if (!updated) return showErrorAlert(c, "Failed to update magazine cover");

  return showSuccessAlert(c, "Cover image updated");
});
