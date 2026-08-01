function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var (Bunny storage)`);
  return value;
}
function normalizePath(path) {
  return path.replace(/^\/+/, "");
}
function storageEndpoint(path) {
  const host = requireEnv("BUNNY_STORAGE_HOST").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const zone = requireEnv("BUNNY_STORAGE_ZONE");
  return `https://${host}/${zone}/${normalizePath(path)}`;
}
function bunnyPublicUrl(path) {
  const base = requireEnv("BUNNY_CDN_BASE").replace(/\/+$/, "");
  return `${base}/${normalizePath(path)}`;
}
function bunnyEnabled() {
  return (process.env.STORAGE_PROVIDER ?? "supabase").toLowerCase() === "bunny";
}
async function bunnyUpload(path, body, contentType = "application/octet-stream") {
  const bytes = new ArrayBuffer(body.byteLength);
  new Uint8Array(bytes).set(body);
  const res = await fetch(storageEndpoint(path), {
    method: "PUT",
    headers: {
      AccessKey: requireEnv("BUNNY_STORAGE_KEY"),
      "Content-Type": contentType
    },
    body: new Blob([bytes], { type: contentType })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Bunny upload failed (${res.status}) for ${path}: ${detail}`);
  }
}
async function bunnyDelete(path) {
  const res = await fetch(storageEndpoint(path), {
    method: "DELETE",
    headers: { AccessKey: requireEnv("BUNNY_STORAGE_KEY") }
  });
  if (!res.ok && res.status !== 404) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Bunny delete failed (${res.status}) for ${path}: ${detail}`);
  }
}
export {
  bunnyDelete,
  bunnyEnabled,
  bunnyPublicUrl,
  bunnyUpload
};
