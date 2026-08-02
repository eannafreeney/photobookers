import { createRoute } from "hono-fsr";
import { db } from "../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  publisherOfTheWeek,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import { verifyStoryUploadToken } from "../../domain/planner/storyUploadToken";
import { uploadImageFromBuffer } from "../../services/storage";
import Alert from "../../components/app/Alert";
import FormPost from "../../components/forms/FormPost";
import FileUploadInput from "../../components/forms/FileUpload";
import ImagePreview from "../../components/forms/ImagePreview";
import DragAndDropArea from "../../features/dashboard/images/components/DragAndDropArea";
import Button from "../../components/app/Button";

async function getRow(kind: "botd" | "aotw" | "potw", id: string) {
  switch (kind) {
    case "botd":
      return db.query.bookOfTheDay.findFirst({
        where: eq(bookOfTheDay.id, id),
        with: { book: { columns: { title: true } } },
      });
    case "aotw":
      return db.query.artistOfTheWeek.findFirst({
        where: eq(artistOfTheWeek.id, id),
        with: { creator: { columns: { displayName: true } } },
      });
    case "potw":
      return db.query.publisherOfTheWeek.findFirst({
        where: eq(publisherOfTheWeek.id, id),
        with: { creator: { columns: { displayName: true } } },
      });
  }
}

async function setImageUrl(
  kind: "botd" | "aotw" | "potw",
  id: string,
  url: string,
) {
  const patch = { artistProvidedStoryImageUrl: url, updatedAt: new Date() };
  switch (kind) {
    case "botd":
      return db.update(bookOfTheDay).set(patch).where(eq(bookOfTheDay.id, id));
    case "aotw":
      return db
        .update(artistOfTheWeek)
        .set(patch)
        .where(eq(artistOfTheWeek.id, id));
    case "potw":
      return db
        .update(publisherOfTheWeek)
        .set(patch)
        .where(eq(publisherOfTheWeek.id, id));
  }
}

function titleFor(kind: string, row: Awaited<ReturnType<typeof getRow>>) {
  if (!row) return "Instagram Story";
  if (kind === "botd" && "book" in row && row.book) {
    return `Book of the Day — ${row.book.title}`;
  }
  if ((kind === "aotw" || kind === "potw") && "creator" in row && row.creator) {
    return `${kind === "aotw" ? "Artist" : "Publisher"} of the Week — ${row.creator.displayName}`;
  }
  return "Instagram Story";
}

export const GET = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(<Alert type="danger" message={tokenError.reason} />);
  }

  const row = await getRow(payload.kind, payload.id);
  if (!row) {
    return c.html(<Alert type="danger" message="Feature not found" />);
  }

  const alpineAttrs = {
    "x-data": "storyUploadForm()",
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return c.html(
    <div class="mx-auto max-w-md p-6">
      <h1 class="mb-2 text-xl font-semibold">
        Upload a vertical image for Instagram Stories
      </h1>
      <p class="mb-4 text-sm text-gray-600">{titleFor(payload.kind, row)}</p>
      <p class="mb-4 text-sm text-gray-600">
        Portrait/vertical (9:16 ratio, e.g. 1080 × 1920 px). One strong image —
        JPG, PNG, or WebP.
      </p>
      <FormPost
        action={`/story-upload/${token}`}
        enctype="multipart/form-data"
        {...alpineAttrs}
      >
        <div class="space-y-4">
          <div
            class="flex flex-col items-center gap-4"
            x-show="previewUrl"
            x-cloak
          >
            <ImagePreview />
          </div>
          <DragAndDropArea />
          <FileUploadInput
            label="Add image"
            name="image"
            required
            x-on:change="onFileChange"
            x-ref="fileInput"
          />
          <p x-show="error" class="text-sm text-red-600" x-text="error"></p>
          <div class="flex gap-2">
            <Button
              variant="solid"
              color="primary"
              x-bind:disabled="isSubmitting || isCompressing"
            >
              <span x-show="!isSubmitting">Upload</span>
              <span x-show="isSubmitting">Uploading…</span>
            </Button>
          </div>
        </div>
      </FormPost>
    </div>,
  );
});

export const POST = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(<Alert type="danger" message={tokenError.reason} />);
  }

  const form = await c.req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return c.html(<Alert type="danger" message="No image provided" />);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = `social/story-uploads/${payload.kind}/${payload.id}`;
  const uploaded = await uploadImageFromBuffer(buffer, folder);

  await setImageUrl(payload.kind, payload.id, uploaded.url);

  return c.html(
    <div class="mx-auto max-w-md p-6">
      <Alert type="success" message="Image uploaded — thank you!" />
      <p class="mt-4 text-sm text-gray-600">
        We’ll use this for your Instagram Story. You can close this page.
      </p>
      <img
        src={uploaded.url}
        alt="Uploaded story"
        class="mt-4 max-h-96 rounded object-contain"
      />
    </div>,
  );
});
