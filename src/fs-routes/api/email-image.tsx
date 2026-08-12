import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { parseEmailImageProxyQuery } from "../../lib/imageUrl";
import {
  EmailImageProxyError,
  resizeRemoteImageForEmail,
} from "../../lib/emailImageProxy";

const CACHE_CONTROL = "public, max-age=2592000, immutable";

/**
 * Resize allowlisted CDN/Supabase images for Brevo newsletter HTML.
 * Query: `?u=<https-url>&w=<width>&q=<quality>`
 */
export const GET = createRoute(async (c: Context) => {
  const parsed = parseEmailImageProxyQuery({
    u: c.req.query("u"),
    w: c.req.query("w"),
    q: c.req.query("q"),
  });
  if (!parsed) {
    return c.text("Invalid or disallowed image request", 400);
  }

  try {
    const { body, contentType } = await resizeRemoteImageForEmail(
      parsed.sourceUrl,
      { width: parsed.width, quality: parsed.quality },
    );
    // Copy into a plain ArrayBuffer-backed Uint8Array for Hono's body type.
    const bytes = new Uint8Array(body.byteLength);
    bytes.set(body);
    return c.body(bytes, 200, {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
    });
  } catch (e) {
    if (e instanceof EmailImageProxyError) {
      return c.text(e.message, e.status as ContentfulStatusCode);
    }
    console.error("email-image proxy", e);
    return c.text("Failed to process image", 500);
  }
});
