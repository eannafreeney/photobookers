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
import FormSuccessScreen from "../../components/forms/FormSuccessScreen";
import FileUploadInput from "../../components/forms/FileUpload";
import DragAndDropArea from "../../features/dashboard/images/components/DragAndDropArea";
import Button from "../../components/app/Button";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import InfoPage from "../../pages/InfoPage";

async function getRow(kind: "botd" | "aotw" | "potw", id: string) {
  switch (kind) {
    case "botd":
      return db.query.bookOfTheDay.findFirst({
        where: eq(bookOfTheDay.id, id),
        with: {
          book: {
            columns: { title: true },
            with: {
              artist: { columns: { displayName: true } },
              publisher: { columns: { displayName: true } },
            },
          },
        },
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
    return row.book.title;
  }
  if ((kind === "aotw" || kind === "potw") && "creator" in row && row.creator) {
    return row.creator.displayName;
  }
  return "Instagram Story";
}

function creditsFor(kind: string, row: Awaited<ReturnType<typeof getRow>>) {
  if (!row || kind !== "botd" || !("book" in row) || !row.book) return null;
  return [row.book.artist?.displayName, row.book.publisher?.displayName]
    .filter(Boolean)
    .join(" · ") || null;
}

export const GET = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(<InfoPage errorMessage={tokenError.reason} />);
  }

  const row = await getRow(payload.kind, payload.id);
  if (!row) {
    return c.html(<InfoPage errorMessage="Feature not found" />);
  }

  const alpineAttrs = {
    "x-data": "storyUploadForm()",
    "x-target": "story-upload-form",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()",
  };

  return c.html(
    <HeadlessLayout title="Upload Instagram Story image">
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
        id="story-upload-form"
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
            <div
              class="relative w-full max-w-[240px] overflow-hidden rounded bg-gray-100"
              style="aspect-ratio: 9/16;"
            >
              <img
                x-bind:src="previewUrl"
                alt="Story preview"
                class="absolute inset-0 h-full w-full object-cover"
              />
              <div
                class="absolute inset-0"
                style="background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, transparent 72%, rgba(0,0,0,0.2) 100%);"
              />
              <div
                class="absolute left-0 right-0"
                style="top: 9.375%; padding-left: 7.4%; padding-right: 7.4%;"
              >
                <div class="text-[10px] font-semibold uppercase tracking-[0.35em] text-white" style="font-size: 10px; line-height: 1;">
                  {payload.kind === "botd"
                    ? "BOOK OF THE DAY"
                    : payload.kind === "aotw"
                      ? "ARTIST OF THE WEEK"
                      : "PUBLISHER OF THE WEEK"}
                </div>
                <div class="font-semibold text-white" style="font-size: 16px; line-height: 1.2; margin-top: 8px; font-family: Georgia, serif;">
                  {titleFor(payload.kind, row)}
                </div>
                {creditsFor(payload.kind, row) && (
                  <div class="text-white/90" style="font-size: 12px; line-height: 1.2; margin-top: 6px;">
                    {creditsFor(payload.kind, row)}
                  </div>
                )}
              </div>
            </div>
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
      </div>
    </HeadlessLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoryUploadToken(token);
  if (tokenError) {
    return c.html(
      <Alert type="danger" message={tokenError.reason} />,
      400,
    );
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

    await setImageUrl(payload.kind, payload.id, uploaded.url);

    return c.html(
      <HeadlessLayout title="Image uploaded">
        <div class="mx-auto max-w-md p-6">
          <FormSuccessScreen
            id="story-upload-success"
            message="Image uploaded — thank you! We’ll use this for your Instagram Story."
          />
        </div>
      </HeadlessLayout>,
    );
  } catch (error) {
    console.error("story upload", error);
    return c.html(
      <Alert type="danger" message="Upload failed — please try again" />,
      500,
    );
  }
});
