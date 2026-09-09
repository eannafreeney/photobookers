/** True when the client sent a form content-type whose body undici cannot parse. */
export function isMalformedBodyError(err: unknown): boolean {
  const msg = (
    err instanceof Error ? err.message : String(err ?? "")
  ).toLowerCase();
  return (
    msg.includes("failed to parse body as formdata") ||
    msg.includes("malformed formdata") ||
    msg.includes("could not parse content as formdata")
  );
}
