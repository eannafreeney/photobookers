// Bunny.net Storage + CDN helpers.
//
// Two Bunny concepts map onto "Supabase Storage + its CDN":
//   - Storage Zone: where files live. We write to it over the HTTP Storage API.
//   - Pull Zone / custom domain: the public CDN read URL (BUNNY_CDN_BASE).
//
// Object paths are kept identical to the Supabase bucket layout (e.g.
// "books/<id>/gallery/<file>.webp"), so migrating URLs is a pure prefix swap.
//
// Env vars:
//   BUNNY_STORAGE_HOST   region host, e.g. "storage.bunnycdn.com"
//   BUNNY_STORAGE_ZONE   storage zone name, e.g. "photobookers-staging"
//   BUNNY_STORAGE_KEY    storage zone password / access key (secret)
//   BUNNY_CDN_BASE       public base, e.g. "https://cdn-staging.photobookers.com"
//   STORAGE_PROVIDER     "bunny" to route writes/URLs to Bunny (default: supabase)

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var (Bunny storage)`);
  return value;
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}

function storageEndpoint(path: string): string {
  // Tolerate BUNNY_STORAGE_HOST set with a scheme, trailing slash, or an
  // accidentally-appended zone/path — keep only the hostname (the zone is added
  // separately below, so a value like "storage.bunnycdn.com/photobookers-staging"
  // must not double the zone into the path).
  const host = requireEnv("BUNNY_STORAGE_HOST")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  const zone = requireEnv("BUNNY_STORAGE_ZONE");
  return `https://${host}/${zone}/${normalizePath(path)}`;
}

/** Public CDN URL for a stored object path. */
export function bunnyPublicUrl(path: string): string {
  const base = requireEnv("BUNNY_CDN_BASE").replace(/\/+$/, "");
  return `${base}/${normalizePath(path)}`;
}

/** Whether image writes/URLs should target Bunny instead of Supabase Storage. */
export function bunnyEnabled(): boolean {
  return (process.env.STORAGE_PROVIDER ?? "supabase").toLowerCase() === "bunny";
}

/** Upload (or overwrite) an object. Bunny PUT always upserts. */
export async function bunnyUpload(
  path: string,
  body: Buffer,
  contentType = "application/octet-stream",
): Promise<void> {
  // Copy into a fresh ArrayBuffer so the body is a plain BlobPart (avoids the
  // SharedArrayBuffer-vs-ArrayBuffer typing on Buffer, and the DOM BodyInit type
  // this project uses omits Uint8Array). Node/undici serialize a Blob correctly.
  const bytes = new ArrayBuffer(body.byteLength);
  new Uint8Array(bytes).set(body);
  const res = await fetch(storageEndpoint(path), {
    method: "PUT",
    headers: {
      AccessKey: requireEnv("BUNNY_STORAGE_KEY"),
      "Content-Type": contentType,
    },
    body: new Blob([bytes], { type: contentType }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Bunny upload failed (${res.status}) for ${path}: ${detail}`);
  }
}

/** Delete an object. A missing object (404) is treated as success. */
export async function bunnyDelete(path: string): Promise<void> {
  const res = await fetch(storageEndpoint(path), {
    method: "DELETE",
    headers: { AccessKey: requireEnv("BUNNY_STORAGE_KEY") },
  });
  if (!res.ok && res.status !== 404) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Bunny delete failed (${res.status}) for ${path}: ${detail}`);
  }
}
