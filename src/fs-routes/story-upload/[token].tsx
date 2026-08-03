import { createRoute } from "hono-fsr";
import { verifyStoryUploadToken } from "../../domain/planner/storyUploadToken";
import { uploadImageFromBuffer } from "../../services/storage";
import Alert from "../../components/app/Alert";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import InfoPage from "../../pages/InfoPage";
import StoryUploadForm from "../../features/story-upload/components/StoryUploadForm";
import {
  getStoryUploadRow,
  setStoryUploadImageUrl,
  storyUploadCredits,
  storyUploadTitle,
} from "../../features/story-upload/utils";

export const GET = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(<InfoPage errorMessage={tokenError.reason} />);
  }

  const row = await getStoryUploadRow(payload.kind, payload.id);
  if (!row) {
    return c.html(<InfoPage errorMessage="Feature not found" />);
  }

  const title = storyUploadTitle(payload.kind, row);
  const credits = storyUploadCredits(payload.kind, row);

  return c.html(
    <HeadlessLayout title="Upload Instagram Story image">
      <div class="mx-auto max-w-md p-6">
        <h1 class="mb-2 text-xl font-semibold">
          Upload a vertical image for Instagram Stories
        </h1>
        <p class="mb-4 text-sm text-gray-600">{title}</p>
        <p class="mb-4 text-sm text-gray-600">
          Portrait/vertical (9:16 ratio, e.g. 1080 × 1920 px). One strong image
          — JPG, PNG, or WebP.
        </p>
        <StoryUploadForm
          token={token}
          kind={payload.kind}
          title={title}
          credits={credits}
        />
      </div>
    </HeadlessLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(<Alert type="danger" message={tokenError.reason} />, 400);
  }

  const form = await c.req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return c.html(<Alert type="danger" message="No image provided" />, 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `social/story-uploads/${payload.kind}/${payload.id}`;
    const uploaded = await uploadImageFromBuffer(buffer, folder);

    await setStoryUploadImageUrl(payload.kind, payload.id, uploaded.url);
    return c.html(
      <Alert
        type="success"
        message="Image uploaded — thank you! Upload again anytime to replace it."
      />,
    );
  } catch (error) {
    console.error("story upload", error);
    return c.html(
      <Alert type="danger" message="Upload failed — please try again" />,
      500,
    );
  }
});
