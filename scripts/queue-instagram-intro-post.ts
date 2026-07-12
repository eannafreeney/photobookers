/**
 * Upload and queue the pinned intro Instagram carousel to Buffer.
 *
 *   npx tsx scripts/queue-instagram-intro-post.ts
 *   DRY_RUN=1 npx tsx scripts/queue-instagram-intro-post.ts
 *
 * Set BUFFER_* env vars. Optional: INTRO_INSTAGRAM_DUE_AT=ISO8601
 */

import "./env";
import { INTRO_PINNED_INSTAGRAM_CAPTION } from "../src/domain/planner/instagramSlides/introPinnedPostContent";
import { INTRO_PINNED_INSTAGRAM_SLIDES } from "../src/domain/planner/instagramSlides/introPinnedPostContent";
import { renderIntroPinnedCarouselSlides } from "../src/domain/planner/instagramSlides/renderIntroPinnedSlide";
import { bufferCreateScheduledImagePost } from "../src/features/dashboard/admin/planner/social-media/buffer";
import { scheduleInstagramDueAt } from "../src/features/dashboard/admin/planner/social-media/instagramUtils";
import { uploadImageFromBuffer } from "../src/services/storage";

const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

async function run() {
  const buffers = await renderIntroPinnedCarouselSlides(
    INTRO_PINNED_INSTAGRAM_SLIDES,
  );

  const imageUrls: string[] = [];
  for (let index = 0; index < buffers.length; index += 1) {
    const buffer = buffers[index];
    if (!buffer) continue;
    if (dryRun) {
      imageUrls.push(`dry-run://intro-pinned/slide-${index + 1}`);
      continue;
    }
    const uploaded = await uploadImageFromBuffer(
      buffer,
      "social/intro-pinned/feed",
    );
    imageUrls.push(uploaded.url);
  }

  const dueAt = scheduleInstagramDueAt(
    process.env.INTRO_INSTAGRAM_DUE_AT
      ? new Date(process.env.INTRO_INSTAGRAM_DUE_AT)
      : new Date(Date.now() + 60 * 60 * 1000),
  );

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          slideCount: imageUrls.length,
          dueAt: dueAt.toISOString(),
          caption: INTRO_PINNED_INSTAGRAM_CAPTION,
        },
        null,
        2,
      ),
    );
    return;
  }

  const [error, result] = await bufferCreateScheduledImagePost({
    text: INTRO_PINNED_INSTAGRAM_CAPTION,
    imageUrls,
    dueAt,
  });

  if (error) {
    console.error("Buffer queue failed:", error.reason);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        postId: result.postId,
        slideCount: imageUrls.length,
        dueAt: dueAt.toISOString(),
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
