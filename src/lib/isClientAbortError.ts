/** True when the client disconnected / cancelled before the handler finished. */
export function isClientAbortError(err: unknown): boolean {
  if (err == null) return false;

  if (typeof err !== "object") {
    return String(err).toLowerCase() === "aborted";
  }

  const e = err as { name?: string; message?: string; code?: string };
  if (e.name === "AbortError") return true;
  if (e.code === "ECONNRESET" || e.code === "EPIPE" || e.code === "ABORT_ERR") {
    return true;
  }

  const msg = (e.message ?? "").toLowerCase();
  return (
    msg === "aborted" ||
    msg === "request aborted" ||
    msg.includes("aborted by the client") ||
    msg.includes("the operation was aborted")
  );
}
