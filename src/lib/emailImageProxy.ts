import {
  EMAIL_IMAGE_DEFAULT_QUALITY,
  EMAIL_IMAGE_MAX_FETCH_WIDTH,
  isAllowedEmailImageSourceHost,
} from "./imageUrl";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;

export type EmailImageProxyResult = {
  body: Buffer;
  contentType: "image/jpeg";
};

/**
 * Fetch an allowlisted remote image and re-encode as JPEG at the requested
 * width. Used by `/api/email-image` so Brevo HTML never points at multi‑MB
 * CDN originals (Bunny Optimizer is not enabled on our pull zone).
 */
export async function resizeRemoteImageForEmail(
  sourceUrl: string,
  {
    width,
    quality = EMAIL_IMAGE_DEFAULT_QUALITY,
  }: { width: number; quality?: number },
): Promise<EmailImageProxyResult> {
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    throw new EmailImageProxyError(400, "Invalid image URL");
  }
  if (parsed.protocol !== "https:") {
    throw new EmailImageProxyError(400, "Only https image URLs are allowed");
  }
  if (!isAllowedEmailImageSourceHost(parsed.hostname)) {
    throw new EmailImageProxyError(400, "Image host is not allowlisted");
  }

  const targetWidth = Math.min(
    Math.max(1, Math.round(width)),
    EMAIL_IMAGE_MAX_FETCH_WIDTH,
  );
  const targetQuality = Math.min(100, Math.max(1, Math.round(quality)));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "image/*,*/*;q=0.8" },
    });
  } catch {
    throw new EmailImageProxyError(502, "Failed to fetch source image");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new EmailImageProxyError(502, `Source image returned ${res.status}`);
  }

  // Reject redirects that escaped the allowlist (fetch follows them).
  const finalHost = new URL(res.url).hostname;
  if (!isAllowedEmailImageSourceHost(finalHost)) {
    throw new EmailImageProxyError(400, "Redirected to a disallowed host");
  }

  const contentLength = Number(res.headers.get("content-length") ?? "0");
  if (contentLength > MAX_INPUT_BYTES) {
    throw new EmailImageProxyError(413, "Source image is too large");
  }

  const input = Buffer.from(await res.arrayBuffer());
  if (input.byteLength > MAX_INPUT_BYTES) {
    throw new EmailImageProxyError(413, "Source image is too large");
  }

  const { default: sharp } = await import("sharp");
  // JPEG: broadest email-client support when we re-encode.
  const body = await sharp(input)
    .rotate()
    .resize(targetWidth, targetWidth, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: targetQuality, mozjpeg: true })
    .toBuffer();

  return { body, contentType: "image/jpeg" };
}

export class EmailImageProxyError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
